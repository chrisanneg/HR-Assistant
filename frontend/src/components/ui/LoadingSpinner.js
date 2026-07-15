import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 flex items-center justify-center">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="relative mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        </motion.div>
        
        <motion.h2 
          className="text-2xl font-bold text-gray-800 dark:text-white mb-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          HR Policy Assistant
        </motion.h2>
        
        <p className="text-gray-600 dark:text-dark-400">
          Loading your intelligent HR guide...
        </p>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;