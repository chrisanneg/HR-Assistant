#!/usr/bin/env python3
"""
Comprehensive Backend Testing for HR Policy Assistant
Tests authentication, file upload, policy management, and chatbot functionality
"""

import requests
import json
import io
import pandas as pd
from pathlib import Path
import uuid
import time

# Configuration
BASE_URL = "https://hr-assist-chat.preview.emergentagent.com/api"
TEST_SESSION = str(uuid.uuid4())

class HRPolicyTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.admin_token = None
        self.user_token = None
        self.test_results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_health_check(self):
        """Test basic API health"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                self.log_result("Health Check", True, "API is running", {"response": data})
                return True
            else:
                self.log_result("Health Check", False, f"API returned {response.status_code}", {"response": response.text})
                return False
        except Exception as e:
            self.log_result("Health Check", False, f"Connection failed: {str(e)}")
            return False
    
    def test_user_registration(self):
        """Test user registration functionality"""
        # Test regular user registration
        regular_user_data = {
            "username": "sarah.johnson",
            "password": "SecurePass123!",
            "is_admin": False
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/register", json=regular_user_data)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Regular User Registration", True, "User registered successfully", {"user_id": data.get("user_id")})
            else:
                self.log_result("Regular User Registration", False, f"Registration failed: {response.status_code}", {"response": response.text})
        except Exception as e:
            self.log_result("Regular User Registration", False, f"Registration error: {str(e)}")
        
        # Test admin user registration
        admin_user_data = {
            "username": "admin.smith",
            "password": "AdminPass456!",
            "is_admin": True
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/register", json=admin_user_data)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Admin User Registration", True, "Admin registered successfully", {"user_id": data.get("user_id")})
            else:
                self.log_result("Admin User Registration", False, f"Admin registration failed: {response.status_code}", {"response": response.text})
        except Exception as e:
            self.log_result("Admin User Registration", False, f"Admin registration error: {str(e)}")
        
        # Test duplicate username
        try:
            response = self.session.post(f"{self.base_url}/auth/register", json=regular_user_data)
            if response.status_code == 400:
                self.log_result("Duplicate Username Prevention", True, "Correctly rejected duplicate username")
            else:
                self.log_result("Duplicate Username Prevention", False, f"Should have rejected duplicate: {response.status_code}")
        except Exception as e:
            self.log_result("Duplicate Username Prevention", False, f"Error testing duplicate: {str(e)}")
    
    def test_user_login(self):
        """Test user login functionality"""
        # Test regular user login
        login_data = {
            "username": "sarah.johnson",
            "password": "SecurePass123!"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.user_token = data.get("token")
                self.log_result("Regular User Login", True, "Login successful", {
                    "username": data.get("username"),
                    "is_admin": data.get("is_admin"),
                    "has_token": bool(self.user_token)
                })
            else:
                self.log_result("Regular User Login", False, f"Login failed: {response.status_code}", {"response": response.text})
        except Exception as e:
            self.log_result("Regular User Login", False, f"Login error: {str(e)}")
        
        # Test admin login
        admin_login_data = {
            "username": "admin.smith",
            "password": "AdminPass456!"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/login", json=admin_login_data)
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data.get("token")
                self.log_result("Admin User Login", True, "Admin login successful", {
                    "username": data.get("username"),
                    "is_admin": data.get("is_admin"),
                    "has_token": bool(self.admin_token)
                })
            else:
                self.log_result("Admin User Login", False, f"Admin login failed: {response.status_code}", {"response": response.text})
        except Exception as e:
            self.log_result("Admin User Login", False, f"Admin login error: {str(e)}")
        
        # Test invalid credentials
        invalid_login = {
            "username": "sarah.johnson",
            "password": "WrongPassword"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/login", json=invalid_login)
            if response.status_code == 401:
                self.log_result("Invalid Credentials Rejection", True, "Correctly rejected invalid credentials")
            else:
                self.log_result("Invalid Credentials Rejection", False, f"Should have rejected invalid credentials: {response.status_code}")
        except Exception as e:
            self.log_result("Invalid Credentials Rejection", False, f"Error testing invalid credentials: {str(e)}")
    
    def create_test_excel_file(self, filename="test_hr_policy.xlsx"):
        """Create a test Excel file with HR policy content"""
        data = {
            "Policy Type": ["Leave Policy", "Dress Code", "Remote Work", "Performance Review"],
            "Description": [
                "Employees are entitled to 20 days of annual leave per year. Leave must be requested 2 weeks in advance.",
                "Business casual attire is required. No shorts, flip-flops, or revealing clothing allowed.",
                "Remote work is permitted up to 2 days per week with manager approval. Must maintain productivity standards.",
                "Annual performance reviews are conducted in December. Goals must be set quarterly."
            ],
            "Consequences": [
                "Unauthorized leave may result in salary deduction or disciplinary action.",
                "Dress code violations will result in verbal warning, then written warning, then suspension.",
                "Remote work privileges may be revoked for performance issues or policy violations.",
                "Poor performance ratings may result in performance improvement plan or termination."
            ]
        }
        
        df = pd.DataFrame(data)
        buffer = io.BytesIO()
        df.to_excel(buffer, index=False)
        buffer.seek(0)
        return buffer.getvalue(), filename
    
    def test_excel_upload(self):
        """Test Excel file upload functionality"""
        if not self.admin_token:
            self.log_result("Excel Upload Test", False, "No admin token available for testing")
            return
        
        # Test successful upload
        try:
            excel_content, filename = self.create_test_excel_file()
            files = {"file": (filename, excel_content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            response = self.session.post(f"{self.base_url}/admin/upload-policy", files=files, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Excel File Upload", True, "File uploaded successfully", {"policy_id": data.get("policy_id")})
            else:
                self.log_result("Excel File Upload", False, f"Upload failed: {response.status_code}", {"response": response.text})
        except Exception as e:
            self.log_result("Excel File Upload", False, f"Upload error: {str(e)}")
        
        # Test upload with regular user (should fail)
        if self.user_token:
            try:
                excel_content, filename = self.create_test_excel_file("unauthorized_test.xlsx")
                files = {"file": (filename, excel_content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
                headers = {"Authorization": f"Bearer {self.user_token}"}
                
                response = self.session.post(f"{self.base_url}/admin/upload-policy", files=files, headers=headers)
                if response.status_code == 403:
                    self.log_result("Admin Access Control", True, "Correctly blocked non-admin upload")
                else:
                    self.log_result("Admin Access Control", False, f"Should have blocked non-admin: {response.status_code}")
            except Exception as e:
                self.log_result("Admin Access Control", False, f"Error testing access control: {str(e)}")
        
        # Test invalid file type
        try:
            invalid_file = b"This is not an Excel file"
            files = {"file": ("test.txt", invalid_file, "text/plain")}
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            response = self.session.post(f"{self.base_url}/admin/upload-policy", files=files, headers=headers)
            if response.status_code == 400:
                self.log_result("Invalid File Type Rejection", True, "Correctly rejected non-Excel file")
            else:
                self.log_result("Invalid File Type Rejection", False, f"Should have rejected non-Excel: {response.status_code}")
        except Exception as e:
            self.log_result("Invalid File Type Rejection", False, f"Error testing file type: {str(e)}")
    
    def test_policy_management(self):
        """Test policy CRUD operations"""
        if not self.admin_token:
            self.log_result("Policy Management Test", False, "No admin token available for testing")
            return
        
        # Test getting policies
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.session.get(f"{self.base_url}/admin/policies", headers=headers)
            if response.status_code == 200:
                policies = response.json()
                self.log_result("Get Policies", True, f"Retrieved {len(policies)} policies", {"count": len(policies)})
                
                # Test deleting a policy if any exist
                if policies:
                    policy_id = policies[0]["id"]
                    delete_response = self.session.delete(f"{self.base_url}/admin/policies/{policy_id}", headers=headers)
                    if delete_response.status_code == 200:
                        self.log_result("Delete Policy", True, "Policy deleted successfully")
                    else:
                        self.log_result("Delete Policy", False, f"Delete failed: {delete_response.status_code}")
                else:
                    self.log_result("Delete Policy", True, "No policies to delete (expected)")
            else:
                self.log_result("Get Policies", False, f"Failed to get policies: {response.status_code}", {"response": response.text})
        except Exception as e:
            self.log_result("Policy Management Test", False, f"Policy management error: {str(e)}")
        
        # Test non-admin access to policies
        if self.user_token:
            try:
                headers = {"Authorization": f"Bearer {self.user_token}"}
                response = self.session.get(f"{self.base_url}/admin/policies", headers=headers)
                if response.status_code == 403:
                    self.log_result("Policy Access Control", True, "Correctly blocked non-admin policy access")
                else:
                    self.log_result("Policy Access Control", False, f"Should have blocked non-admin: {response.status_code}")
            except Exception as e:
                self.log_result("Policy Access Control", False, f"Error testing policy access: {str(e)}")
    
    def test_chatbot_integration(self):
        """Test Gemini chatbot functionality"""
        # Upload a policy first for context
        if self.admin_token:
            try:
                excel_content, filename = self.create_test_excel_file("chatbot_test_policy.xlsx")
                files = {"file": (filename, excel_content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
                headers = {"Authorization": f"Bearer {self.admin_token}"}
                self.session.post(f"{self.base_url}/admin/upload-policy", files=files, headers=headers)
            except:
                pass  # Continue even if upload fails
        
        # Test chat functionality
        chat_requests = [
            {
                "message": "What is the company's leave policy?",
                "session_id": TEST_SESSION,
                "expected_keywords": ["leave", "annual", "days"]
            },
            {
                "message": "What happens if I violate the dress code?",
                "session_id": TEST_SESSION,
                "expected_keywords": ["dress", "warning", "violation"]
            },
            {
                "message": "Can I work from home?",
                "session_id": TEST_SESSION,
                "expected_keywords": ["remote", "work", "manager"]
            }
        ]
        
        for i, chat_req in enumerate(chat_requests):
            try:
                response = self.session.post(f"{self.base_url}/chat", json=chat_req)
                if response.status_code == 200:
                    data = response.json()
                    chat_response = data.get("response", "").lower()
                    
                    # Check if response contains expected keywords
                    keyword_found = any(keyword in chat_response for keyword in chat_req["expected_keywords"])
                    
                    if keyword_found and len(chat_response) > 10:
                        self.log_result(f"Chatbot Response {i+1}", True, "Received relevant response", {
                            "question": chat_req["message"],
                            "response_length": len(chat_response),
                            "message_id": data.get("message_id")
                        })
                    else:
                        self.log_result(f"Chatbot Response {i+1}", False, "Response not relevant or too short", {
                            "question": chat_req["message"],
                            "response": chat_response[:200] + "..." if len(chat_response) > 200 else chat_response
                        })
                else:
                    self.log_result(f"Chatbot Response {i+1}", False, f"Chat failed: {response.status_code}", {"response": response.text})
            except Exception as e:
                self.log_result(f"Chatbot Response {i+1}", False, f"Chat error: {str(e)}")
            
            # Small delay between requests
            time.sleep(1)
    
    def test_chat_history(self):
        """Test chat history functionality"""
        try:
            response = self.session.get(f"{self.base_url}/chat/history/{TEST_SESSION}")
            if response.status_code == 200:
                history = response.json()
                self.log_result("Chat History Retrieval", True, f"Retrieved {len(history)} messages", {"count": len(history)})
                
                # Verify history structure
                if history:
                    first_msg = history[0]
                    required_fields = ["id", "message", "response", "timestamp"]
                    has_all_fields = all(field in first_msg for field in required_fields)
                    
                    if has_all_fields:
                        self.log_result("Chat History Structure", True, "History has correct structure")
                    else:
                        self.log_result("Chat History Structure", False, "History missing required fields", {"fields": list(first_msg.keys())})
                else:
                    self.log_result("Chat History Structure", True, "No history to validate (expected)")
            else:
                self.log_result("Chat History Retrieval", False, f"History retrieval failed: {response.status_code}", {"response": response.text})
        except Exception as e:
            self.log_result("Chat History Retrieval", False, f"History error: {str(e)}")
    
    def test_authentication_validation(self):
        """Test token validation and authentication requirements"""
        # Test accessing protected endpoint without token
        try:
            response = self.session.get(f"{self.base_url}/admin/policies")
            if response.status_code == 401:
                self.log_result("No Token Protection", True, "Correctly requires authentication")
            else:
                self.log_result("No Token Protection", False, f"Should require auth: {response.status_code}")
        except Exception as e:
            self.log_result("No Token Protection", False, f"Error testing no token: {str(e)}")
        
        # Test with invalid token
        try:
            headers = {"Authorization": "Bearer invalid-token-12345"}
            response = self.session.get(f"{self.base_url}/admin/policies", headers=headers)
            if response.status_code == 401:
                self.log_result("Invalid Token Protection", True, "Correctly rejected invalid token")
            else:
                self.log_result("Invalid Token Protection", False, f"Should reject invalid token: {response.status_code}")
        except Exception as e:
            self.log_result("Invalid Token Protection", False, f"Error testing invalid token: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting HR Policy Assistant Backend Tests")
        print(f"📍 Testing against: {self.base_url}")
        print(f"🔑 Session ID: {TEST_SESSION}")
        print("=" * 80)
        
        # Run tests in logical order
        if not self.test_health_check():
            print("❌ Health check failed - stopping tests")
            return self.test_results
        
        self.test_user_registration()
        self.test_user_login()
        self.test_authentication_validation()
        self.test_excel_upload()
        self.test_policy_management()
        self.test_chatbot_integration()
        self.test_chat_history()
        
        print("=" * 80)
        print("📊 TEST SUMMARY")
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        
        if total - passed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['message']}")
        
        return self.test_results

def main():
    """Main test execution"""
    tester = HRPolicyTester()
    results = tester.run_all_tests()
    
    # Return results for programmatic access
    return results

if __name__ == "__main__":
    main()