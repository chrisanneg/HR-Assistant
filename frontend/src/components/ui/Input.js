import React from 'react';
import { motion } from 'framer-motion';

const Input = ({ 
  label, 
  error, 
  className = '', 
  icon: Icon,
  ...props 
}) => {
  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400 dark:text-dark-500" />
          </div>
        )}
        
        <input
          className={`
            w-full px-4 py-3 border rounded-lg transition-all duration-200
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${Icon ? 'pl-10' : ''}
            ${error 
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
              : 'border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700'
            }
            text-gray-900 dark:text-white
            placeholder-gray-500 dark:placeholder-dark-400
            ${className}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <motion.p 
          className="text-sm text-red-600 dark:text-red-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default Input;