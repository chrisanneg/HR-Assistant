# HR Policy Assistant

A comprehensive AI-powered HR management system that combines intelligent policy consultation with advanced ticket management. Built with **React** frontend, **FastAPI** backend, **MongoDB** database, and powered by **Google Gemini AI**.

## 🎯 Features


### 🤖 **AI-Powered Chat Assistant**
- **Dual Response System**: Provides both company-specific policy guidance and general HR advice
- **Google Gemini AI Integration**: Fast, accurate responses using Gemini 2.5 Flash model
- **Context-Aware**: Automatically distinguishes between company policies and general HR topics
- **Smart Question Recognition**: Provides targeted answers for procedures, consequences, requirements, etc.
- **Individual Session Management**: Each employee gets unique sessions with timestamp-based session creation
- **Fresh Session on Login**: New session created every time a non-admin user logs in or refreshes
- **Welcome Messages**: Dynamic content based on uploaded policies
- **Chat History Management**: Session-specific history with easy navigation

### 🔔 **Real-Time Notification System**
- **Admin Response Notifications**: Employees receive notifications when admins respond to their tickets
- **Real-Time Updates**: 30-second polling for instant notification delivery
- **Unread Count Tracking**: Visual indicators for new notifications
- **Notification Bar**: Clean, accessible notification interface
- **Auto-Refresh**: Notifications automatically update without page refresh
- **Employee-Specific**: Notifications are user-specific and secure

### 🎫 **Advanced Ticket Management System**
- **Employee Ticket Creation**: Easy-to-use modal form for HR requests
- **Employee Ticket Dashboard**: Comprehensive ticket viewing interface for employees
- **Admin Dashboard**: Complete ticket management interface for administrators
- **Real-time Status Updates**: Track tickets from creation to resolution
- **Two-way Communication**: Response system between employees and administrators
- **Notification Integration**: Automatic notifications when admins respond
- **Bulk Operations**: Mass selection and deletion capabilities
- **Advanced Filtering**: Search by status, category, employee name, and keywords
- **Priority Management**: Low, Medium, High, and Urgent priority levels
- **Category Organization**: Leave, Payroll, Policy, Workplace, Performance, and Other

### 🏢 **Admin Dashboard**
- **Policy Upload**: Upload HR policy documents (Excel format)
- **Policy Management**: View, manage, and delete uploaded policies
- **Ticket Administration**: Complete ticket lifecycle management
- **User Management**: Admin authentication and role-based access
- **Analytics**: Ticket statistics and performance metrics
- **Response Management**: Add responses to tickets with automatic employee notification

### 💬 **Interactive Chat Interface**
- **Real-time Chat**: Smooth, responsive chat experience
- **Session Management**: Persistent chat history per user session with unique session IDs
- **Typing Indicators**: Visual feedback during AI response generation
- **Markdown Support**: Rich text formatting in responses
- **Theme Toggle**: Dark/Light mode support
- **Quick Questions**: Pre-defined questions for easy interaction

### 🔐 **Enhanced Authentication System**
- **User Registration/Login**: Secure user authentication
- **Admin Privileges**: Role-based access control
- **Token-Based Security**: HTTP Bearer token authentication
- **Session Persistence**: Automatic login state management
- **Individual User Sessions**: Each user gets their own isolated chat sessions

## � Usage

### For Employees
1. **Registration & Login**: Register with your credentials or login with existing account
2. **Chat Interface**: Start chatting with the HR assistant in the main interface
3. **Notification System**: Check the notification bell icon for admin responses to your tickets
4. **Ticket Dashboard**: View your ticket history and admin responses in the Employee Dashboard
5. **Fresh Sessions**: Each login/refresh creates a new chat session for better experience
6. **Individual History**: Your chat history is completely separate from other employees

### For Administrators
1. **Admin Login**: Login with admin credentials to access admin features
2. **Policy Management**: Use the File Upload feature to upload HR policies (Excel files)
3. **Policy Dashboard**: View and manage uploaded policies in the Policy List
4. **Ticket Management**: Monitor employee interactions and respond to tickets
5. **Notification Sending**: Send notifications to employees regarding their ticket responses
6. **Session Continuity**: Admin sessions persist across browser refreshes

### Enhanced Session Management
- **Non-Admin Users**: Each login or page refresh creates a new timestamp-based session
- **Admin Users**: Maintain consistent sessions across browser refreshes
- **Individual History**: Each employee has their own separate chat history
- **Session Format**: `{username}_session_{timestamp}` for fresh non-admin sessions
- **Legacy Support**: Existing sessions continue to work seamlessly

### Real-Time Notification Features
- **Automatic Polling**: System checks for new notifications every 30 seconds
- **Visual Indicators**: Notification bell with unread count badge
- **Direct Access**: Click notifications to view ticket responses and admin communications
- **Read Management**: Mark individual notifications as read
- **Dashboard Integration**: Seamless access to Employee Ticket Dashboard

### Ticket Workflow
1. **Employee Submission**: Create tickets through the chat interface
2. **Admin Processing**: Admins review and respond to tickets
3. **Notification Delivery**: Employees receive real-time notifications for responses
4. **History Tracking**: Complete audit trail of all ticket interactions
5. **Status Management**: Track ticket progress from creation to resolution

## �🛠 Tech Stack

### Frontend
- **React 18.2.0** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Axios** - HTTP client for API calls
- **Lucide React** - Modern icon library
- **React Markdown** - Markdown rendering support

### Backend  
- **FastAPI** - High-performance Python web framework
- **Python 3.10+** - Core backend language
- **Google Generative AI** - Gemini API integration
- **Motor** - Async MongoDB driver
- **Uvicorn** - ASGI server
- **Pandas** - Excel file processing
- **Python-dotenv** - Environment configuration

### Database
- **MongoDB** - Document-based NoSQL database
- **Motor** - Async MongoDB driver for Python

### AI Integration
- **Google Gemini API** - Advanced language model
- **Model**: `gemini-2.5-flash` for fast responses
- **Context Processing**: Intelligent policy knowledge integration
- **Response Optimization**: Tailored answers based on query type

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+**
- **Node.js 16+**
- **MongoDB** (Local or Atlas)
- **Google Gemini API Key**

### 1. Clone Repository
```bash
git clone <repository-url>
cd HRassistant
```

### 2. Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
# Create .env with the following:
GEMINI_API_KEY=your_gemini_api_key_here
MONGO_URL=mongodb://localhost:27017
DB_NAME=hr_assistant
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Start backend server
python server.py
```

### 3. Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Create environment file
# Create .env with:
REACT_APP_BACKEND_URL=http://localhost:8001

# Start frontend development server
npm start
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs

## ⚙️ Configuration

### Backend Environment (.env)
```properties
# Database Configuration
MONGO_URL=mongodb://localhost:27017
DB_NAME=hr_assistant

# CORS Configuration  
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend Environment (.env)
```properties
# Backend API Configuration
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 📁 Project Structure

```
HRassistant/
├── README.md
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── .env                  # Environment configuration
│   └── __pycache__/          # Python cache files
├── frontend/
│   ├── public/
│   │   ├── index.html        # Main HTML template
│   │   └── manifest.json     # PWA manifest
│   ├── src/
│   │   ├── App.js            # Main App component
│   │   ├── index.js          # React entry point
│   │   ├── index.css         # Global styles
│   │   ├── components/
│   │   │   ├── MainApp.js    # Main application logic
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.js
│   │   │   │   ├── FileUpload.js
│   │   │   │   └── PolicyList.js
│   │   │   ├── auth/
│   │   │   │   └── LoginScreen.js
│   │   │   ├── chat/
│   │   │   │   ├── ChatInterface.js
│   │   │   │   ├── ChatMessage.js
│   │   │   │   ├── TypingIndicator.js
│   │   │   │   └── WelcomeMessage.js
│   │   │   ├── notifications/
│   │   │   │   └── NotificationBar.js  # Real-time notification system
│   │   │   ├── tickets/
│   │   │   │   ├── TicketForm.js          # Ticket creation modal
│   │   │   │   ├── TicketDashboard.js     # Admin ticket management
│   │   │   │   └── EmployeeTicketDashboard.js # Employee ticket viewing
│   │   │   ├── layout/
│   │   │   │   └── Header.js
│   │   │   └── ui/
│   │   │       ├── Button.js
│   │   │       ├── Input.js
│   │   │       ├── LoadingSpinner.js
│   │   │       └── AnimatedTitle.js
│   │   └── contexts/
│   │       ├── AuthContext.js
│   │       └── ThemeContext.js
│   ├── package.json          # Node.js dependencies
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   ├── postcss.config.js     # PostCSS configuration
│   └── craco.config.js       # CRACO configuration
└── Sample_HR_Policies.xlsx   # Sample policy document
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Admin (Protected)
- `POST /api/admin/upload-policy` - Upload HR policy document
- `GET /api/admin/policies` - List all policies
- `DELETE /api/admin/policies/{policy_id}` - Delete policy

### Chat
- `GET /api/chat/welcome` - Get welcome message and FAQs
- `POST /api/chat` - Send chat message to AI (supports individual sessions)
- `GET /api/chat/history/{session_id}` - Get chat history for specific session
- `GET /api/chat/sessions` - List all chat sessions for authenticated user
- `DELETE /api/chat/history/{session_id}` - Delete specific session
- `DELETE /api/chat/history` - Clear all chat history

### Notifications
- `GET /api/notifications` - Get notifications for authenticated user
- `PATCH /api/notifications/{notification_id}/read` - Mark notification as read
- `POST /api/notifications` - Create new notification (internal use)

### Tickets
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets` - Get all tickets
- `PATCH /api/tickets/{ticket_id}/status` - Update ticket status
- `POST /api/tickets/{ticket_id}/responses` - Add response to ticket
- `DELETE /api/tickets/{ticket_id}` - Delete single ticket
- `DELETE /api/tickets/bulk` - Bulk delete tickets

### Health
- `GET /api/` - Health check endpoint
- `GET /health` - Detailed health status

## 💡 Usage Examples

### Chat Queries

#### Company Policy Questions
- "What is the annual leave policy?"
- "What are the consequences for dress code violations?"
- "How do I request work from home?"
- "What happens if I'm frequently late?"
- "What is the sick leave policy?"
- "How does the performance review process work?"

#### General HR Guidance
- "How to negotiate salary?"
- "How to handle workplace conflicts?"
- "Steps to file a harassment complaint?"
- "How to prepare for performance reviews?"
- "What are my rights as an employee?"
- "How to request accommodations for disabilities?"

### Ticket Management

#### Creating a Ticket (Employee)
1. Click "Create Ticket" button in chat interface
2. Fill in ticket details:
   - Title: Brief description of the issue
   - Description: Detailed explanation
   - Category: Leave, Payroll, Policy, Workplace, Performance, Other
   - Priority: Low, Medium, High, Urgent
   - Department: Auto-assigned based on user
3. Submit and receive confirmation
4. Track status updates in real-time

#### Managing Tickets (Admin)
1. Access Admin Dashboard
2. View ticket statistics and overview
3. Filter tickets by status, category, or search term
4. Click on ticket to view details and respond
5. Update ticket status (Open → In Progress → Resolved → Closed)
6. Add responses and communicate with employees
7. Use bulk selection for mass operations

#### Bulk Ticket Operations
1. Click "Select Multiple" in ticket dashboard
2. Select individual tickets or use "Select All"
3. Click "Delete Selected" for bulk deletion
4. Confirm action in dialog
5. Selected tickets are permanently removed

### Admin Functions

#### Upload Policy Document
1. Login as admin user
2. Navigate to Admin Dashboard  
3. Click "Upload Policy"
4. Select Excel file (.xlsx/.xls)
5. Upload and confirm
6. Policy is immediately available to AI system

#### Manage Policies
- View all uploaded policies with metadata
- Delete outdated or incorrect policies
- Monitor policy usage and effectiveness

## 🔧 Troubleshooting

### Common Issues

#### Server Connection Issues
```bash
# Check if ports are available
netstat -ano | findstr :8001  # Backend (Updated port)
netstat -ano | findstr :3000  # Frontend

# Kill processes if needed
taskkill /PID [process_id] /F
```

#### Port Configuration Issues
- **Backend Port**: Ensure server runs on port 8001 (updated from 8002)
- **Frontend Environment**: Check `REACT_APP_API_URL=http://localhost:8001` in .env
- **Consistent Configuration**: Both frontend and backend must use same port

#### Session Management Issues
- **Fresh Sessions**: Non-admin users get new sessions on each login/refresh
- **Session Format**: New format `{username}_session_{timestamp}` for non-admins
- **Legacy Sessions**: Existing sessions continue to work seamlessly
- **Admin Sessions**: Admins maintain consistent session IDs across refreshes

#### Notification System Issues
- **Polling Frequency**: Notifications check every 30 seconds automatically
- **Network Connectivity**: Ensure stable connection for real-time notifications
- **Browser Refresh**: Notifications persist across page refreshes
- **Read Status**: Check notification read status updates properly

#### CORS Policy Blocking
```bash
# Ensure backend .env includes your frontend port:
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

#### MongoDB Connection Errors
```bash
# Start MongoDB service (Windows)
net start MongoDB

# Or start MongoDB manually
mongod --dbpath="C:\data\db"
```

#### Gemini API Issues
- Verify API key is correct in .env file
- Check API quota and billing status
- Ensure internet connection is stable
- Review error logs for specific issues

#### Ticket Creation Failures
- Check backend logs for ObjectId serialization errors
- Verify MongoDB connection is stable
- Ensure all required fields are provided

### Performance Optimization

#### Backend
- Use async/await for database operations
- Implement response caching for common queries
- Optimize MongoDB queries with indexes
- Monitor server logs for bottlenecks

#### Frontend  
- Lazy load components with React.lazy()
- Implement virtual scrolling for large ticket lists
- Use React.memo for expensive components
- Optimize re-renders with proper dependency arrays

## 🚦 Development Guidelines

### Code Style
- **Backend**: Follow PEP 8 Python style guide
- **Frontend**: Use ESLint and Prettier for consistent formatting
- **Commits**: Use conventional commit messages
- **Documentation**: Clear comments and docstrings

### Testing
```bash
# Backend testing
cd backend
python test_server.py

# Frontend testing  
cd frontend
npm test
```

### Building for Production
```bash
# Frontend build
cd frontend
npm run build

# Backend production server
cd backend
uvicorn server:app --host 0.0.0.0 --port 8002
```

## 📦 Dependencies

### Backend Key Dependencies
- `fastapi` - Modern, fast web framework
- `motor` - Async MongoDB driver  
- `google-generativeai` - Gemini AI client
- `pandas` - Excel file processing
- `python-dotenv` - Environment management
- `uvicorn` - Lightning-fast ASGI server
- `pydantic` - Data validation using Python type hints

### Frontend Key Dependencies
- `react` - A JavaScript library for building user interfaces
- `axios` - Promise based HTTP client
- `tailwindcss` - A utility-first CSS framework
- `framer-motion` - A production-ready motion library for React
- `lucide-react` - Beautiful & consistent icon toolkit
- `react-markdown` - React component to render markdown

## 🔐 Security Features

### API Security
- **Token-based authentication**: HTTP Bearer tokens
- **CORS protection**: Configured cross-origin resource sharing
- **Input validation**: Pydantic models for data sanitization
- **Environment variable protection**: Sensitive data in .env files

### Data Protection
- **Password hashing**: SHA-256 encryption for user passwords
- **Secure MongoDB connections**: Authenticated database access
- **API key protection**: Environment variable storage
- **Role-based access control**: Admin vs employee permissions

## 🎯 Key Features Deep Dive

### AI Response System
The AI system uses a sophisticated dual-response approach:

#### Company Policy Responses
When queries relate to uploaded policies:
```
🏢 Company Procedure: [Specific process steps]
📋 Steps to Follow:
1. [Detailed step-by-step instructions]
⚠️ Requirements: [Prerequisites and deadlines]
💼 Company Policy Reference: [Source document]
```

#### General HR Guidance
For topics not covered in company policies:
```
💡 General HR Guidance: [Industry best practices]
📋 Detailed Steps:
1. [Comprehensive guidance with explanations]
⚠️ Important Considerations: [Legal and compliance notes]
💼 Recommendation: [Contact HR for company-specific procedures]
```

### Ticket Lifecycle Management
1. **Creation**: Employee submits ticket with categorization
2. **Assignment**: Auto-routed to admin dashboard
3. **Processing**: Admin reviews and updates status
4. **Communication**: Two-way messaging system
5. **Resolution**: Final status update and archival

### Advanced Search & Filtering
- **Text Search**: Search across titles, descriptions, and employee names
- **Status Filter**: Open, In Progress, Resolved, Closed
- **Category Filter**: Leave, Payroll, Policy, Workplace, Performance
- **Priority Filter**: Low, Medium, High, Urgent
- **Date Range**: Filter by creation or update dates

## 📈 Future Enhancements

### Planned Features
- **Mobile App**: React Native mobile application
- **Advanced Analytics**: Comprehensive reporting dashboard
- **File Upload Variety**: Support for PDF, Word documents
- **Voice Integration**: Speech-to-text and text-to-speech
- **Integration APIs**: Slack, Microsoft Teams integration
- **Workflow Automation**: Automated ticket routing and escalation
- **Multi-language Support**: Internationalization (i18n)
- **Email Notifications**: Automated ticket status updates
- **Knowledge Base**: Searchable FAQ and documentation system

### Technical Improvements
- **Caching Layer**: Redis for improved performance
- **Load Balancing**: Multiple backend instances
- **Containerization**: Docker deployment ready
- **CI/CD Pipeline**: Automated testing and deployment
- **Monitoring**: Application performance monitoring (APM)
- **Backup System**: Automated database backups
- **Rate Limiting**: API request throttling
- **WebSocket Integration**: Real-time notifications

## 🎨 User Interface Features

### Theme System
- **Dark Mode**: Eye-friendly dark theme
- **Light Mode**: Clean, professional light theme
- **System Preference**: Automatic theme detection
- **Persistent Settings**: Theme preference storage

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Adapted layouts for tablet screens
- **Desktop Experience**: Full-featured desktop interface
- **Cross-Browser**: Compatible with modern browsers

### Accessibility
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and descriptions
- **Color Contrast**: WCAG compliant color schemes
- **Focus Management**: Proper focus indicators

## 📊 Performance Metrics

### Expected Performance
- **Chat Response Time**: < 2 seconds average
- **Ticket Operations**: < 500ms average
- **Policy Upload**: < 5 seconds for typical Excel files
- **Dashboard Loading**: < 1 second for 100+ tickets
- **Search Performance**: < 200ms for filtered results

### Scalability Considerations
- **Concurrent Users**: Designed for 100+ simultaneous users
- **Database Performance**: Optimized MongoDB queries
- **API Throughput**: 1000+ requests per minute capacity
- **File Processing**: Handles large policy documents efficiently

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, please contact:
- **Email**: support@hrassistant.com
- **Documentation**: [Project Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)

---

**Made with ❤️ for better HR experiences**
