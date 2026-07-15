import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, MessageCircle, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../../contexts/ThemeContext';

const WelcomeMessage = ({ message, quickQuestions, onQuickQuestion }) => {
  const { darkMode } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Welcome Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl shadow-lg mb-4"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Bot className="w-10 h-10 text-white" />
        </motion.div>
        
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className={`text-2xl font-bold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome to HR Policy Assistant!
          </h2>
          <Sparkles className="w-5 h-5 text-blue-500" />
        </div>
      </motion.div>

      {/* Welcome Message Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={`${
          darkMode 
            ? 'bg-dark-700/50 border-dark-600' 
            : 'bg-gradient-to-r from-blue-50 to-purple-50 border-gray-200'
        } border rounded-2xl p-6 shadow-lg`}
      >
        <div className={`text-sm leading-relaxed markdown ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className={`text-xl font-bold mb-3 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className={`text-lg font-bold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className={`text-base font-bold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-3 last:mb-0">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-none mb-3 space-y-1">{children}</ul>
              ),
              li: ({ children }) => (
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{children}</span>
                </li>
              ),
              strong: ({ children }) => (
                <strong className={`font-semibold ${
                  darkMode ? 'text-blue-300' : 'text-blue-600'
                }`}>
                  {children}
                </strong>
              ),
            }}
          >
            {message}
          </ReactMarkdown>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2">
          <MessageCircle className={`w-5 h-5 ${
            darkMode ? 'text-blue-400' : 'text-blue-500'
          }`} />
          <h3 className={`font-semibold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Try these quick questions:
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickQuestions.map((question, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onQuickQuestion(question)}
              className={`
                p-4 text-left rounded-xl transition-all duration-200 border-2
                ${darkMode 
                  ? 'bg-dark-700/50 hover:bg-dark-600/50 border-dark-600 hover:border-blue-500 text-white' 
                  : 'bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 text-gray-800'
                }
                shadow-md hover:shadow-lg
              `}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-1.5 rounded-lg ${
                  darkMode ? 'bg-blue-600' : 'bg-blue-500'
                }`}>
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-medium leading-relaxed flex-1">
                  {question}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Getting Started Tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className={`text-center p-4 rounded-xl ${
          darkMode 
            ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 text-dark-300' 
            : 'bg-gradient-to-r from-purple-50 to-blue-100 text-gray-600'
        }`}
      >
        <p className="text-sm">
          💡 <strong>Pro tip:</strong> I can help with both company-specific policies and general HR guidance. 
          Just ask me anything!
        </p>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeMessage;