from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from copy import deepcopy
import pandas as pd
import io
from contextlib import asynccontextmanager
import ast

import hashlib
import google.generativeai as genai

class _InsertOneResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class _DeleteResult:
    def __init__(self, deleted_count):
        self.deleted_count = deleted_count


class _UpdateResult:
    def __init__(self, matched_count, modified_count):
        self.matched_count = matched_count
        self.modified_count = modified_count


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

SAMPLE_POLICY_FILE = ROOT_DIR.parent / 'Sample_HR_Policies.xlsx'


def build_sample_policy_context() -> str:
    """Load the bundled sample HR policies so they can be used as the primary knowledge source."""
    if not SAMPLE_POLICY_FILE.exists():
        return ""

    try:
        sample_df = load_sample_policy_dataframe()
        if sample_df.empty:
            return ""

        context_parts = ["Bundled Sample HR Policy Knowledge Base (primary source):\n"]
        for _, row in sample_df.iterrows():
            policy_title = str(row.get("Policy Title", "Unknown Policy")).strip()
            policy_category = str(row.get("Policy Category", "General")).strip()
            policy_description = str(row.get("Policy Description", "")).strip()
            consequences = str(row.get("Consequences for Violations", "")).strip()

            context_parts.append(
                f"Category: {policy_category}\n"
                f"Policy: {policy_title}\n"
                f"Description: {policy_description}\n"
                f"Consequences: {consequences}\n"
            )

        return "\n".join(context_parts)
    except Exception as error:
        print(f"Failed to load sample policy context: {error}")
        return ""


def load_sample_policy_dataframe() -> pd.DataFrame:
    """Load sample policies from the Excel file, or fall back to the Python source file if needed."""
    try:
        return pd.read_excel(SAMPLE_POLICY_FILE)
    except Exception:
        fallback_file = ROOT_DIR.parent / 'sample_hr_policies.py'
        if not fallback_file.exists():
            return pd.DataFrame()

        try:
            source = fallback_file.read_text(encoding='utf-8')
            tree = ast.parse(source)

            class _PolicyDictVisitor(ast.NodeVisitor):
                def __init__(self):
                    self.policy_dict = None

                def visit_Assign(self, node):
                    for target in node.targets:
                        if isinstance(target, ast.Name) and target.id == 'hr_policies':
                            self.policy_dict = ast.literal_eval(node.value)

            visitor = _PolicyDictVisitor()
            visitor.visit(tree)

            if not visitor.policy_dict:
                return pd.DataFrame()

            return pd.DataFrame(visitor.policy_dict)
        except Exception as error:
            print(f"Failed to load sample policies from Python source: {error}")
            return pd.DataFrame()


def find_relevant_sample_policies(question: str, max_policies: int = 4) -> str:
    """Return the most relevant bundled sample policies for the given question."""
    if not SAMPLE_POLICY_FILE.exists():
        return ""

    try:
        sample_df = load_sample_policy_dataframe()
        if sample_df.empty:
            return ""

        question_terms = {
            term
            for term in question.lower().replace("/", " ").replace("-", " ").split()
            if len(term) > 2
        }

        scored_rows = []
        for _, row in sample_df.iterrows():
            policy_category = str(row.get("Policy Category", "")).lower()
            policy_title = str(row.get("Policy Title", "")).lower()
            policy_description = str(row.get("Policy Description", "")).lower()
            consequences = str(row.get("Consequences for Violations", "")).lower()
            combined_text = " ".join([policy_category, policy_title, policy_description, consequences])

            score = sum(1 for term in question_terms if term in combined_text)
            if score > 0:
                scored_rows.append((score, row))

        if not scored_rows:
            return ""

        scored_rows.sort(key=lambda item: item[0], reverse=True)
        context_parts = ["Matched Sample HR Policy Excerpts (highest priority):\n"]
        for _, row in scored_rows[:max_policies]:
            context_parts.append(
                f"Category: {row.get('Policy Category', 'General')}\n"
                f"Policy: {row.get('Policy Title', 'Unknown Policy')}\n"
                f"Description: {row.get('Policy Description', '')}\n"
                f"Consequences: {row.get('Consequences for Violations', '')}\n"
            )

        return "\n".join(context_parts)
    except Exception as error:
        print(f"Failed to match sample policy context: {error}")
        return ""


class _InMemoryCursor:
    def __init__(self, documents):
        self._documents = documents

    def sort(self, field_name, direction=1):
        reverse = direction == -1
        self._documents.sort(key=lambda document: document.get(field_name), reverse=reverse)
        return self

    async def to_list(self, length):
        return [deepcopy(document) for document in self._documents[:length]]


def _matches_filter(document, filter_data):
    for key, expected_value in (filter_data or {}).items():
        actual_value = document.get(key)
        if isinstance(expected_value, dict) and "$in" in expected_value:
            if actual_value not in expected_value["$in"]:
                return False
        elif actual_value != expected_value:
            return False
    return True


class _InMemoryCollection:
    def __init__(self):
        self._documents = []

    async def find_one(self, filter_data):
        for document in self._documents:
            if _matches_filter(document, filter_data):
                return deepcopy(document)
        return None

    async def insert_one(self, document):
        stored_document = deepcopy(document)
        stored_document.setdefault("_id", stored_document.get("id", str(uuid.uuid4())))
        self._documents.append(stored_document)
        return _InsertOneResult(stored_document["_id"])

    def find(self, filter_data=None):
        matching_documents = [
            deepcopy(document)
            for document in self._documents
            if _matches_filter(document, filter_data)
        ]
        return _InMemoryCursor(matching_documents)

    async def delete_one(self, filter_data):
        for index, document in enumerate(self._documents):
            if _matches_filter(document, filter_data):
                del self._documents[index]
                return _DeleteResult(1)
        return _DeleteResult(0)

    async def delete_many(self, filter_data):
        if not filter_data:
            deleted_count = len(self._documents)
            self._documents.clear()
            return _DeleteResult(deleted_count)

        remaining_documents = []
        deleted_count = 0
        for document in self._documents:
            if _matches_filter(document, filter_data):
                deleted_count += 1
            else:
                remaining_documents.append(document)

        self._documents = remaining_documents
        return _DeleteResult(deleted_count)

    async def count_documents(self, filter_data):
        return sum(1 for document in self._documents if _matches_filter(document, filter_data))

    async def distinct(self, field_name):
        unique_values = []
        for document in self._documents:
            if field_name in document and document[field_name] not in unique_values:
                unique_values.append(document[field_name])
        return unique_values

    async def update_one(self, filter_data, update_data):
        for document in self._documents:
            if _matches_filter(document, filter_data):
                modified_count = 0
                if "$set" in update_data:
                    document.update(update_data["$set"])
                    modified_count = 1
                if "$push" in update_data:
                    for field_name, value in update_data["$push"].items():
                        document.setdefault(field_name, [])
                        document[field_name].append(deepcopy(value))
                        modified_count = 1
                return _UpdateResult(1, modified_count)
        return _UpdateResult(0, 0)


class _InMemoryDatabase:
    def __init__(self):
        self.users = _InMemoryCollection()
        self.policies = _InMemoryCollection()
        self.chat_history = _InMemoryCollection()
        self.tickets = _InMemoryCollection()

    def __getattr__(self, item):
        collection = _InMemoryCollection()
        setattr(self, item, collection)
        return collection


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure Gemini AI
genai.configure(api_key=os.environ['GEMINI_API_KEY'])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'test_database')
client = None
db = _InMemoryDatabase()

try:
    sync_client = MongoClient(mongo_url, serverSelectionTimeoutMS=2000)
    sync_client.admin.command('ping')
    sync_client.close()
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    print(f"Connected to MongoDB at {mongo_url}")
except Exception as e:
    print(f"MongoDB unavailable, using in-memory store: {e}")

# Create the main app without a prefix
# app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer(auto_error=False)

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str
    is_admin: bool = False

class PolicyDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    content: str
    uploaded_by: str
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    message: str
    response: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    message: str
    session_id: str

class ChatResponse(BaseModel):
    response: str
    message_id: str

# Helper functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    token = credentials.credentials
    user = await db.users.find_one({"id": token})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    
    return User(**user)

async def require_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Authentication routes
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Create user
    user = User(
        username=user_data.username,
        password_hash=hash_password(user_data.password),
        is_admin=user_data.is_admin
    )
    
    await db.users.insert_one(user.dict())
    return {"message": "User created successfully", "user_id": user.id}

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    user = await db.users.find_one({"username": login_data.username})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "id": user["id"],
        "token": user["id"],
        "username": user["username"],
        "is_admin": user["is_admin"]
    }

# Policy management routes (Admin only)
@api_router.post("/admin/upload-policy")
async def upload_policy(
    file: UploadFile = File(...),
    current_user: User = Depends(require_admin)
):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Only Excel files are allowed")
    
    try:
        # Read Excel file
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # Extract all text content from the Excel file
        text_content = ""
        for column in df.columns:
            text_content += f"{column}:\n"
            for value in df[column].dropna():
                text_content += f"{str(value)}\n"
            text_content += "\n"
        
        # Save to database
        policy = PolicyDocument(
            filename=file.filename,
            content=text_content,
            uploaded_by=current_user.username
        )
        
        await db.policies.insert_one(policy.dict())
        
        return {"message": "Policy uploaded successfully", "policy_id": policy.id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@api_router.get("/admin/policies")
async def get_policies(current_user: User = Depends(require_admin)):
    policies = await db.policies.find().to_list(1000)
    return [
        {
            "id": policy["id"],
            "filename": policy["filename"],
            "uploaded_by": policy["uploaded_by"],
            "uploaded_at": policy["uploaded_at"]
        }
        for policy in policies
    ]

@api_router.delete("/admin/policies/{policy_id}")
async def delete_policy(policy_id: str, current_user: User = Depends(require_admin)):
    result = await db.policies.delete_one({"id": policy_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"message": "Policy deleted successfully"}

# Chat routes
@api_router.get("/chat/welcome")
async def get_welcome_message():
    """Get welcome message and default FAQs"""
    try:
        # Get policy count for context
        policy_count = await db.policies.count_documents({})
        
        if policy_count > 0:
            welcome_msg = f"""👋 **Welcome to HR Policy Assistant!** 

I'm your comprehensive HR guide powered by Gemini AI! I can help you with:

🏢 **Your Company Policies** ({policy_count} uploaded documents)
🌐 **General HR Guidance** (when topics aren't in company policies)

🤖 **Powered by**: Gemini AI (gemini-2.0-flash model)

📋 **Popular Company Policy Questions**:
🔹 What is the annual leave policy?
🔹 What are the consequences for dress code violations? 
🔹 Can I work from home and what are the requirements?
🔹 What happens if I'm frequently late to work?
🔹 What is the sick leave policy and consequences for abuse?
🔹 How does the performance review process work?
🔹 What are the disciplinary procedures?
🔹 What equipment policies apply to remote work?

💡 **I can also help with general HR topics like**:
🔹 How to negotiate salary or ask for a raise?
🔹 How to handle workplace conflicts?
🔹 What are my rights as an employee?
🔹 How to improve my performance at work?
🔹 How to request accommodations for disabilities?
🔹 Steps to file a complaint about harassment?
🔹 How to prepare for performance reviews?

✨ **What makes me special**:
• I automatically provide consequences for policy violations
• I suggest relevant follow-up questions
• I give detailed step-by-step guidance for topics not in your company policies
• I distinguish between company-specific policies and general HR advice

Feel free to ask me anything about HR - company policies or general guidance! 🚀"""
        else:
            welcome_msg = """👋 **Welcome to HR Policy Assistant!**

🤖 **Powered by**: Gemini AI (gemini-2.0-flash model)

⚠️ **No company HR policies uploaded yet** - but I can still help!

💡 **I can provide detailed guidance on general HR topics like**:
🔹 How to negotiate salary or ask for a raise?
🔹 How to handle workplace conflicts and difficult colleagues?
🔹 What are my basic rights as an employee?
🔹 How to improve performance and productivity?
🔹 Steps to request accommodations or medical leave?
🔹 How to file complaints about harassment or discrimination?
🔹 Career development and skill building strategies?
🔹 Interview preparation and job search tips?
🔹 Understanding benefits, insurance, and retirement planning?

✨ **What I provide**:
• Detailed step-by-step instructions
• Legal considerations and best practices
• Potential consequences and outcomes
• Actionable next steps and recommendations

Once your admin uploads company policies, I'll also provide specific policy guidance!

Ask me any HR question - I'm here to help! 🚀"""

        return {"welcome_message": welcome_msg, "policy_count": policy_count}
    
    except Exception as e:
        return {"welcome_message": "Welcome to HR Policy Assistant! How can I help you today?", "policy_count": 0}

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(chat_request: ChatRequest):
    try:
        # Load bundled sample policies first so they take priority in the model prompt.
        sample_context = find_relevant_sample_policies(chat_request.message) or build_sample_policy_context()

        # Get all uploaded policies for additional context
        policies = await db.policies.find().to_list(1000)
        
        # Combine all policy content with sample policies first
        context_parts = []
        if sample_context:
            context_parts.append(sample_context)

        if policies:
            uploaded_context = ["Uploaded HR Policy Documents (secondary source):\n"]
            for policy in policies:
                uploaded_context.append(f"From {policy['filename']}:\n{policy['content']}\n")
            context_parts.append("\n".join(uploaded_context))

        context = "\n\n".join(context_parts) if context_parts else "No HR policies have been uploaded yet. Please contact your administrator."

        if sample_context and policies:
            context += "\n\nPriority note: Use the bundled sample HR policies first. Only use uploaded documents to supplement or clarify details not covered in the sample policies."
        
        # Compose the optimized system prompt for faster processing
        system_prompt = f"""You are an HR Policy Assistant powered by Gemini AI. Provide concise, targeted answers.

PRIORITY RULE:
- Treat the bundled sample HR policies as the primary source of truth.
- If uploaded policies conflict with the sample policies, prefer the bundled sample policies.
- Use uploaded policies only to supplement or clarify the sample policies when needed.

COMPANY POLICIES:
{context}

ANSWERING RULE:
- If the matched sample policies contain the answer, use those details directly.
- Do not fall back to generic HR guidance when an exact sample policy is available.
- Summarize the policy clearly and include consequences when present.

RE
CRITICAL: ANALYZE THE SPECIFIC QUESTION CAREFULLY
- Pay attention to what exactly the user is asking about
- If they ask about "procedure", "steps", "how to", "process" - provide step-by-step instructions
- If they ask about "consequences", "violations", "penalties" - focus on outcomes
- If they ask about "requirements", "eligibility", "who can" - focus on criteria
- Don't give generic policy overviews when they ask specific questions

DUAL RESPONSE SYSTEM:

**FOR COMPANY POLICY TOPICS** (when the topic is mentioned in company policies):

OPTION A - If asking for PROCEDURES/STEPS (e.g., "How to request leave", "What's the process", "Steps to"):
🏢 **Company Procedure**: Based on our policy, here's the process:

📋 **Steps to Follow**:
1. [Specific step 1]
2. [Specific step 2]
3. [Specific step 3]
[Continue with detailed steps]

⚠️ **Requirements**: [What's needed, deadlines, approvals]
💼 **Company Policy Reference**: [Brief mention of related policy]

OPTION B - If asking for CONSEQUENCES/VIOLATIONS (e.g., "What happens if", "Penalties", "Consequences"):
🏢 **Company Consequences**: According to our policy:

⚠️ **Violations Result In**:
• [Specific consequence 1]
• [Specific consequence 2]
• [Progressive discipline steps if applicable]

📋 **Policy Context**: [Brief policy reference for context]

OPTION C - If asking for GENERAL POLICY OVERVIEW:
🏢 **Company Policy**: [Policy details as provided in knowledge base]
⚠️ **Consequences**: [Consequences for violations]

❓ **Related Questions**:
   • [Follow-up question 1]
   • [Follow-up question 2]
   • [Follow-up question 3]

**FOR GENERAL HR GUIDANCE** (when NOT specifically covered in company policies):
💡 **General HR Guidance**: This specific aspect isn't detailed in your company's uploaded policies, but here's comprehensive guidance:

📋 **Detailed Steps**:
1. [Step 1 with detailed explanation]
2. [Step 2 with detailed explanation]  
3. [Step 3 with detailed explanation]
4. [Additional steps as needed]

⚠️ **Important Considerations**:
• [Key consideration 1]
• [Key consideration 2]
• [Legal or best practice note]

💼 **Recommendation**: Contact your HR department to clarify your company's specific procedures on this matter.

❓ **You might also want to know**:
   • [Related question 1]
   • [Related question 2]
   • [Related question 3]

QUESTION TYPE RECOGNITION:
- "How do I..." = Provide step-by-step procedure
- "What is the process..." = Provide step-by-step procedure  
- "What are the steps..." = Provide step-by-step procedure
- "What happens if..." = Focus on consequences/outcomes
- "What are the consequences..." = Focus on consequences/outcomes
- "Who can..." = Focus on eligibility/requirements
- "When can I..." = Focus on timing/requirements
- "What is the policy..." = Provide policy overview

CORE BEHAVIOR RULES:
1. **Answer the specific question asked** - Don't give generic policy overviews for specific procedure questions
2. **Be precise**: If they ask for steps, give steps. If they ask for consequences, focus on consequences
3. **Use context intelligently**: Extract relevant information from the policy knowledge base to answer the specific question
4. **Provide actionable guidance**: Always include next steps and practical advice
5. **Distinguish sources**: Make clear if information comes from company policy or general HR guidance

Always provide targeted, specific answers that directly address what the user is asking for."""
        
        
        # Send message to Gemini AI (much faster than Ollama)
        model = genai.GenerativeModel('gemini-2.5-flash')  # Using fastest available model
        
        # Configure for faster responses
        generation_config = genai.types.GenerationConfig(
            temperature=0.7,
            max_output_tokens=800,  # Limit token count for faster responses
            top_p=0.8,
            top_k=40
        )
        
        # Combine system prompt and user message for Gemini
        full_prompt = f"{system_prompt}\n\nUser Question: {chat_request.message}"
        
        response = model.generate_content(full_prompt, generation_config=generation_config)
        response_text = response.text

        # Save chat history
        chat_message = ChatMessage(
            session_id=chat_request.session_id,
            message=chat_request.message,
            response=response_text
        )
        
        await db.chat_history.insert_one(chat_message.dict())
        
        return ChatResponse(response=response_text, message_id=chat_message.id)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@api_router.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    messages = await db.chat_history.find({"session_id": session_id}).sort("timestamp", 1).to_list(1000)
    return [
        {
            "id": msg["id"],
            "message": msg["message"],
            "response": msg["response"],
            "timestamp": msg["timestamp"]
        }
        for msg in messages
    ]

@api_router.get("/chat/sessions")
async def get_chat_sessions():
    """Get all unique session IDs"""
    try:
        # Get distinct session IDs from chat history
        session_ids = await db.chat_history.distinct("session_id")
        return session_ids
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sessions: {str(e)}")

@api_router.delete("/chat/history/{session_id}")
async def delete_chat_session(session_id: str):
    """Delete all messages for a specific session"""
    try:
        result = await db.chat_history.delete_many({"session_id": session_id})
        return {"message": f"Deleted {result.deleted_count} messages from session {session_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting session: {str(e)}")

@api_router.delete("/chat/history")
async def clear_all_chat_history():
    """Delete all chat history"""
    try:
        result = await db.chat_history.delete_many({})
        return {"message": f"Cleared all chat history. Deleted {result.deleted_count} messages."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing history: {str(e)}")

# Tickets endpoints
@api_router.post("/tickets")
async def create_ticket(ticket_data: dict):
    """Create a new HR ticket"""
    try:
        logger.info(f"Creating ticket with data: {ticket_data}")
        
        ticket = {
            "id": str(uuid.uuid4()),
            "title": ticket_data["title"],
            "description": ticket_data["description"],
            "category": ticket_data["category"],
            "priority": ticket_data.get("priority", "medium"),
            "department": ticket_data.get("department", ""),
            "employee_name": ticket_data.get("employee_name", "Anonymous"),
            "employee_id": ticket_data.get("employee_id", ""),
            "status": "open",
            "responses": [],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        logger.info(f"Inserting ticket: {ticket}")
        result = await db.tickets.insert_one(ticket)
        logger.info(f"Ticket inserted with ID: {result.inserted_id}")
        
        # Return ticket without MongoDB's _id field to avoid serialization issues
        created_ticket = {
            "id": ticket["id"],
            "title": ticket["title"],
            "description": ticket["description"],
            "category": ticket["category"],
            "priority": ticket["priority"],
            "department": ticket["department"],
            "employee_name": ticket["employee_name"],
            "employee_id": ticket["employee_id"],
            "status": ticket["status"],
            "responses": ticket["responses"],
            "created_at": ticket["created_at"],
            "updated_at": ticket["updated_at"]
        }
        
        return created_ticket
    except Exception as e:
        logger.error(f"Error creating ticket: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error creating ticket: {str(e)}")

@api_router.get("/tickets")
async def get_tickets():
    """Get all tickets"""
    try:
        tickets = await db.tickets.find({}).sort("created_at", -1).to_list(1000)
        # Convert ObjectId to string for JSON serialization
        for ticket in tickets:
            if "_id" in ticket:
                ticket["_id"] = str(ticket["_id"])
        return tickets
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tickets: {str(e)}")

@api_router.patch("/tickets/{ticket_id}/status")
async def update_ticket_status(ticket_id: str, status_data: dict):
    """Update ticket status"""
    try:
        result = await db.tickets.update_one(
            {"id": ticket_id},
            {
                "$set": {
                    "status": status_data["status"],
                    "updated_at": datetime.utcnow().isoformat()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        return {"message": "Ticket status updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating ticket status: {str(e)}")

@api_router.post("/tickets/{ticket_id}/responses")
async def add_ticket_response(ticket_id: str, response_data: dict):
    """Add a response to a ticket"""
    try:
        response = {
            "id": str(uuid.uuid4()),
            "response": response_data["response"],
            "responder": response_data.get("responder", "Admin"),
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = await db.tickets.update_one(
            {"id": ticket_id},
            {
                "$push": {"responses": response},
                "$set": {"updated_at": datetime.utcnow().isoformat()}
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        return {"message": "Response added successfully", "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding response: {str(e)}")

@api_router.delete("/tickets/{ticket_id}")
async def delete_ticket(ticket_id: str):
    """Delete a ticket"""
    try:
        result = await db.tickets.delete_one({"id": ticket_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        return {"message": "Ticket deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting ticket: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error deleting ticket: {str(e)}")

@api_router.delete("/tickets/bulk")
async def delete_multiple_tickets(ticket_ids: dict):
    """Delete multiple tickets at once"""
    try:
        ids = ticket_ids.get("ticket_ids", [])
        if not ids:
            raise HTTPException(status_code=400, detail="No ticket IDs provided")
        
        result = await db.tickets.delete_many({"id": {"$in": ids}})
        
        return {
            "message": f"Successfully deleted {result.deleted_count} ticket(s)",
            "deleted_count": result.deleted_count
        }
    except Exception as e:
        logger.error(f"Error deleting multiple tickets: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error deleting tickets: {str(e)}")

# Health check
@api_router.get("/")
async def root():
    return {"message": "HR Policy Chatbot API is running"}



@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    if client:
        client.close()

app = FastAPI(lifespan=lifespan)

# Add a simple health check endpoint
@app.get("/")
async def health_check():
    return {"status": "ok", "message": "HR Assistant API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8002)
    # print("Use: uvicorn server:app --host 127.0.0.1 --port 8001 --reload")
