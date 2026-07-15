import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, MessageSquare, Calendar, Search, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../ui/Button';

const ChatHistory = ({ isOpen, onClose, currentSessionId }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'messageCount'
  const [expandedSession, setExpandedSession] = useState(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    if (isOpen) {
      fetchChatSessions();
    }
  }, [isOpen]);

  const fetchChatSessions = async () => {
    setLoading(true);
    try {
      // Get all unique session IDs first
      const sessionsResponse = await fetch('/api/chat/sessions');
      const sessionIds = await sessionsResponse.json();
      
      // Fetch history for each session
      const sessionPromises = sessionIds.map(async (sessionId) => {
        const response = await fetch(`/api/chat/history/${sessionId}`);
        const messages = await response.json();
        return {
          sessionId,
          messages,
          messageCount: messages.length,
          lastActivity: messages.length > 0 ? new Date(messages[messages.length - 1].timestamp) : new Date(),
          preview: messages.length > 0 ? messages[0].message.substring(0, 100) : 'No messages'
        };
      });
      
      const sessionsData = await Promise.all(sessionPromises);
      setSessions(sessionsData.filter(session => session.messages.length > 0));
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this chat session?')) {
      try {
        await fetch(`/api/chat/history/${sessionId}`, {
          method: 'DELETE'
        });
        setSessions(sessions.filter(session => session.sessionId !== sessionId));
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const clearAllHistory = async () => {
    if (window.confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      try {
        await fetch('/api/chat/history', {
          method: 'DELETE'
        });
        setSessions([]);
      } catch (error) {
        console.error('Error clearing history:', error);
      }
    }
  };

  const filteredSessions = sessions
    .filter(session => 
      session.preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.sessionId.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.lastActivity) - new Date(a.lastActivity);
      } else {
        return b.messageCount - a.messageCount;
      }
    });

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-4xl h-[80vh] ${
            darkMode ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
          } border rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className={`p-6 border-b ${darkMode ? 'border-dark-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Chat History
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-dark-400' : 'text-gray-600'}`}>
                    {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Button variant="ghost" onClick={onClose}>
                ×
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                    darkMode 
                      ? 'bg-dark-700 border-dark-600 text-white placeholder-dark-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-4 py-2 border rounded-lg ${
                  darkMode 
                    ? 'bg-dark-700 border-dark-600 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="date">Sort by Date</option>
                <option value="messageCount">Sort by Messages</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className={`w-16 h-16 mb-4 ${darkMode ? 'text-dark-600' : 'text-gray-300'}`} />
                <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-dark-400' : 'text-gray-500'}`}>
                  {searchTerm ? 'No matching conversations' : 'No chat history yet'}
                </h3>
                <p className={`${darkMode ? 'text-dark-500' : 'text-gray-400'}`}>
                  {searchTerm ? 'Try a different search term' : 'Start a conversation to see it here'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <motion.div
                    key={session.sessionId}
                    layout
                    className={`${
                      darkMode ? 'bg-dark-700/50 border-dark-600' : 'bg-gray-50 border-gray-200'
                    } border rounded-lg p-4 ${
                      session.sessionId === currentSessionId ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`text-sm font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            Session {session.sessionId.substring(0, 8)}...
                          </span>
                          {session.sessionId === currentSessionId && (
                            <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mb-2 ${darkMode ? 'text-dark-400' : 'text-gray-600'}`}>
                          {session.preview}...
                        </p>
                        <div className="flex items-center space-x-4 text-xs">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span className={darkMode ? 'text-dark-500' : 'text-gray-500'}>
                              {formatDate(session.lastActivity)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="w-3 h-3" />
                            <span className={darkMode ? 'text-dark-500' : 'text-gray-500'}>
                              {session.messageCount} messages
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedSession(
                            expandedSession === session.sessionId ? null : session.sessionId
                          )}
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${
                            expandedSession === session.sessionId ? 'rotate-180' : ''
                          }`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSession(session.sessionId)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Messages */}
                    <AnimatePresence>
                      {expandedSession === session.sessionId && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 space-y-3 max-h-60 overflow-y-auto"
                        >
                          {session.messages.map((message, index) => (
                            <div key={message.id || index} className="space-y-2">
                              <div className={`p-3 rounded-lg ${
                                darkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                              }`}>
                                <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                                  <strong>You:</strong> {message.message}
                                </p>
                              </div>
                              <div className={`p-3 rounded-lg ${
                                darkMode ? 'bg-dark-600' : 'bg-white'
                              }`}>
                                <p className={`text-sm ${darkMode ? 'text-dark-200' : 'text-gray-700'}`}>
                                  <strong>Assistant:</strong> {message.response}
                                </p>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {sessions.length > 0 && (
            <div className={`p-6 border-t ${darkMode ? 'border-dark-700' : 'border-gray-200'}`}>
              <Button
                variant="outline"
                onClick={clearAllHistory}
                className="text-red-500 border-red-300 hover:bg-red-50 hover:border-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All History
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatHistory;
