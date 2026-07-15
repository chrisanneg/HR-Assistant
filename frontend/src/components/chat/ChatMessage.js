import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, AlertCircle, Ticket } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../../contexts/ThemeContext';

const ChatMessage = ({ message, onRaiseTicket }) => {
  const { darkMode } = useTheme();
  const isUser = message.isUser;
  const content = isUser ? message.message : message.response;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'} space-x-3`}>
        {/* Avatar */}
        <motion.div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
              : message.isError
                ? 'bg-red-500'
                : 'bg-gradient-to-r from-purple-500 to-pink-500'
          }`}
          whileHover={{ scale: 1.1 }}
        >
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : message.isError ? (
            <AlertCircle className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </motion.div>

        {/* Message Content */}
        <motion.div
          className={`relative px-4 py-3 rounded-2xl ${
            isUser
              ? darkMode
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500 text-white'
              : message.isError
                ? darkMode
                  ? 'bg-red-900/50 border border-red-700 text-red-200'
                  : 'bg-red-50 border border-red-200 text-red-700'
                : darkMode
                  ? 'bg-dark-700 border border-dark-600 text-white'
                  : 'bg-gray-50 border border-gray-200 text-gray-900'
          } shadow-lg`}
          whileHover={{ scale: 1.01 }}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed">{content}</p>
          ) : (
            <div className="text-sm leading-relaxed markdown">
              <ReactMarkdown
                components={{
                  // Custom styling for markdown elements
                  h1: ({ children }) => (
                    <h1 className={`text-lg font-bold mb-2 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className={`text-base font-bold mb-2 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className={`text-sm font-bold mb-1 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="ml-2">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic">{children}</em>
                  ),
                  code: ({ children }) => (
                    <code className={`px-1 py-0.5 rounded text-xs font-mono ${
                      darkMode 
                        ? 'bg-dark-600 text-blue-300' 
                        : 'bg-gray-200 text-blue-600'
                    }`}>
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className={`p-3 rounded-lg overflow-x-auto text-xs font-mono mb-2 ${
                      darkMode 
                        ? 'bg-dark-600 text-blue-300' 
                        : 'bg-gray-200 text-blue-600'
                    }`}>
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className={`border-l-4 pl-3 mb-2 italic ${
                      darkMode 
                        ? 'border-blue-400 text-dark-300' 
                        : 'border-blue-500 text-gray-600'
                    }`}>
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}

          {!isUser && onRaiseTicket && (
            <div className="mt-3 flex justify-end">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onRaiseTicket(message)}
                className={`inline-flex items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  darkMode
                    ? 'bg-dark-600 text-dark-200 hover:bg-dark-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Raise Ticket</span>
              </motion.button>
            </div>
          )}
          
          {/* Timestamp */}
          <div className={`text-xs mt-2 ${
            isUser 
              ? 'text-blue-100' 
              : darkMode 
                ? 'text-dark-400' 
                : 'text-gray-500'
          }`}>
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;