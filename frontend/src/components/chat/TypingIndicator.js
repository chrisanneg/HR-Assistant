import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const TypingIndicator = () => {
  const { darkMode } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start mb-4"
    >
      <div className="flex max-w-3xl space-x-3">
        {/* Avatar */}
        <motion.div
          className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Bot className="w-4 h-4 text-white" />
        </motion.div>

        {/* Typing Animation */}
        <motion.div
          className={`px-4 py-3 rounded-2xl shadow-lg ${
            darkMode 
              ? 'bg-dark-700 border border-dark-600' 
              : 'bg-gray-50 border border-gray-200'
          }`}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${
              darkMode ? 'text-dark-300' : 'text-gray-600'
            }`}>
              Thinking
            </span>
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    darkMode ? 'bg-dark-400' : 'bg-gray-400'
                  }`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;