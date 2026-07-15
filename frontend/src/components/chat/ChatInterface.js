import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import WelcomeMessage from './WelcomeMessage';
import ChatHistory from './ChatHistory';
import TicketForm from '../tickets/TicketForm';
import Button from '../ui/Button';
import axios from 'axios';

function bulletsToMarkdown(text) {
  // Replace any line starting with • or 🔹 followed by a space with markdown list dash
  return text.replace(/^[ \t]*[•🔹][ \t]+/gm, '- ');
}
const ChatInterface = () => {
  const { darkMode } = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [policyCount, setPolicyCount] = useState(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTicketFormOpen, setIsTicketFormOpen] = useState(false);
  const [ticketDraft, setTicketDraft] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
//#endregion

  const fetchWelcomeMessage = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chat/welcome`);
      setWelcomeMessage(response.data.welcome_message);
      setPolicyCount(response.data.policy_count);
    } catch (error) {
      console.error('Error fetching welcome message:', error);
      setWelcomeMessage('Welcome to HR Policy Assistant! How can I help you today?');
    }
  }, [API_BASE_URL]);

  const fetchChatHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chat/history/${sessionId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  }, [API_BASE_URL, sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getLatestAssistantMessage = () => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (!messages[index].isUser) {
        return messages[index];
      }
    }
    return null;
  };

  const getLatestUserMessage = () => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].isUser) {
        return messages[index];
      }
    }
    return null;
  };

  const isUnresolvedResponse = (text = '') => {
    const normalized = text.toLowerCase();
    return [
      'general hr guidance',
      "isn't detailed",
      'contact your hr department',
      'no company hr policies uploaded yet',
      'could not process',
      'encountered an error'
    ].some(fragment => normalized.includes(fragment));
  };

  const openTicketForMessage = (assistantMessage) => {
    if (!assistantMessage) return;

    const assistantIndex = messages.findIndex(message => message.id === assistantMessage.id);
    const priorUserMessage = assistantIndex >= 0
      ? [...messages.slice(0, assistantIndex)].reverse().find(message => message.isUser)
      : getLatestUserMessage();

    const transcript = messages
      .map(message => `${message.isUser ? 'User' : 'Assistant'}: ${message.isUser ? message.message : message.response}`)
      .join('\n\n');

    const fallbackQuestion = input.trim() || 'Unresolved HR question';
    const questionText = priorUserMessage?.message || fallbackQuestion;
    const assistantText = assistantMessage.response || 'No assistant response was captured.';

    setTicketDraft({
      title: `Unresolved HR query: ${questionText.slice(0, 60)}`,
      description: `The chatbot could not fully resolve this HR question.\n\nQuestion:\n${questionText}\n\nAssistant Response:\n${assistantText}\n\nChat Transcript:\n${transcript}`,
      category: 'policy',
      priority: 'medium',
      department: 'Human Resources'
    });
    setIsTicketFormOpen(true);
  };

  const openTicketForCurrentQuestion = () => {
    openTicketForMessage(getLatestAssistantMessage());
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    fetchWelcomeMessage();
    fetchChatHistory();
  }, [fetchWelcomeMessage, fetchChatHistory]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      id: `msg_${Date.now()}`,
      message: input.trim(),
      response: '',
      timestamp: new Date().toISOString(),
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: input.trim(),
        session_id: sessionId
      });

      const botMessage = {
        id: response.data.message_id,
        message: input.trim(),
        response: response.data.response,
        timestamp: new Date().toISOString(),
        isUser: false
      };

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...userMessage };
        updated.push(botMessage);
        return updated;
      });

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: `error_${Date.now()}`,
        message: input.trim(),
        response: 'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: new Date().toISOString(),
        isUser: false,
        isError: true
      };

      setMessages(prev => {
        const updated = [...prev];
        updated.push(errorMessage);
        return updated;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "What is the annual leave policy?",
    "What are the consequences for dress code violations?",
    "Can I work from home?",
    "What happens if I'm frequently late?",
    "What is the sick leave policy?",
    "How does the performance review process work?"
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-5xl w-full mx-auto min-h-screen h-screen">
      <div className={`${
        darkMode 
          ? 'bg-dark-800/80 border-dark-700' 
          : 'bg-white/80 border-gray-200'
      } backdrop-blur-lg border rounded-2xl shadow-2xl h-full flex flex-col overflow-hidden`}>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${
            darkMode ? 'bg-dark-700/80 border-dark-600' : 'bg-gray-50/80 border-gray-200'
          } border-b p-6`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
            <motion.div
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Bot className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                HR Policy Assistant
              </h2>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className={`text-sm ${darkMode ? 'text-dark-400' : 'text-gray-600'}`}>
                  Powered by Chrisanne, Jhai , Abhishek and Sanika • {policyCount} policies loaded
                </span>
              </div>
            </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsHistoryOpen(true)}>
                Chat History
              </Button>
              {isUnresolvedResponse(getLatestAssistantMessage()?.response) && (
                <Button variant="primary" size="sm" onClick={openTicketForCurrentQuestion}>
                  Raise Ticket
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <WelcomeMessage 
             message={bulletsToMarkdown(welcomeMessage)}
             quickQuestions={quickQuestions}
             onQuickQuestion={handleQuickQuestion}/>

          )}

          {/* Chat Messages */}
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onRaiseTicket={!message.isUser ? openTicketForMessage : undefined}
              />
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && <TypingIndicator />}

          {messages.length > 0 && isUnresolvedResponse(getLatestAssistantMessage()?.response) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border p-4 ${
                darkMode ? 'bg-amber-900/20 border-amber-700 text-amber-100' : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold">This answer looks unresolved.</p>
                  <p className="text-sm opacity-90">You can raise a ticket with the full chat transcript for HR follow-up.</p>
                </div>
                <Button variant="primary" onClick={openTicketForCurrentQuestion}>
                  Raise Ticket
                </Button>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${
            darkMode ? 'bg-dark-700/80 border-dark-600' : 'bg-gray-50/80 border-gray-200'
          } border-t p-6`}
        >
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about HR policies or general HR guidance..."
                className={`
                  w-full px-4 py-3 pr-12 border rounded-xl resize-none transition-all duration-200
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${darkMode 
                    ? 'bg-dark-800 border-dark-600 text-white placeholder-dark-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }
                `}
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
                disabled={isTyping}
              />
              
              <motion.div
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                  variant="primary"
                  size="sm"
                  className="p-2 rounded-lg"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Quick Questions */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4"
            >
              <p className={`text-sm font-medium mb-3 ${
                darkMode ? 'text-dark-300' : 'text-gray-700'
              }`}>
                Quick questions to get started:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.slice(0, 3).map((question, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickQuestion(question)}
                    className={`
                      px-3 py-2 text-sm rounded-lg transition-all duration-200
                      ${darkMode 
                        ? 'bg-dark-600 hover:bg-dark-500 text-dark-200 border border-dark-500' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                      }
                    `}
                  >
                    {question}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <ChatHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        currentSessionId={sessionId}
      />

      <TicketForm
        isOpen={isTicketFormOpen}
        onClose={() => setIsTicketFormOpen(false)}
        onTicketCreated={() => setIsTicketFormOpen(false)}
        initialData={ticketDraft}
      />
    </div>
  );
};

export default ChatInterface;