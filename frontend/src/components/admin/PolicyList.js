import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Trash2, Calendar, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../ui/Button';

const PolicyList = ({ policies, onDelete, loading }) => {
  const { darkMode } = useTheme();

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`${
              darkMode ? 'bg-dark-700' : 'bg-gray-100'
            } rounded-lg p-4 animate-pulse`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${
                  darkMode ? 'bg-dark-600' : 'bg-gray-200'
                } rounded-lg`} />
                <div className="space-y-2">
                  <div className={`h-4 w-32 ${
                    darkMode ? 'bg-dark-600' : 'bg-gray-200'
                  } rounded`} />
                  <div className={`h-3 w-24 ${
                    darkMode ? 'bg-dark-600' : 'bg-gray-200'
                  } rounded`} />
                </div>
              </div>
              <div className={`w-8 h-8 ${
                darkMode ? 'bg-dark-600' : 'bg-gray-200'
              } rounded`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (policies.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className={`mx-auto w-16 h-16 ${
          darkMode ? 'bg-dark-700' : 'bg-gray-100'
        } rounded-full flex items-center justify-center mb-4`}>
          <FileText className={`w-8 h-8 ${
            darkMode ? 'text-dark-400' : 'text-gray-400'
          }`} />
        </div>
        <h3 className={`text-lg font-medium mb-2 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          No policies uploaded yet
        </h3>
        <p className={`${darkMode ? 'text-dark-400' : 'text-gray-500'}`}>
          Upload your first HR policy document to get started
        </p>
      </motion.div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      <AnimatePresence>
        {policies.map((policy) => (
          <motion.div
            key={policy.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            layout
            className={`${
              darkMode 
                ? 'bg-dark-700 border-dark-600 hover:bg-dark-600' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            } border rounded-lg p-4 transition-all duration-200`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium truncate ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {policy.filename}
                  </h4>
                  
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1">
                      <User className={`w-3 h-3 ${
                        darkMode ? 'text-dark-400' : 'text-gray-400'
                      }`} />
                      <span className={`text-xs ${
                        darkMode ? 'text-dark-400' : 'text-gray-500'
                      }`}>
                        {policy.uploaded_by}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Calendar className={`w-3 h-3 ${
                        darkMode ? 'text-dark-400' : 'text-gray-400'
                      }`} />
                      <span className={`text-xs ${
                        darkMode ? 'text-dark-400' : 'text-gray-500'
                      }`}>
                        {formatDate(policy.uploaded_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  onClick={() => onDelete(policy.id)}
                  variant="danger"
                  size="sm"
                  className="p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default PolicyList;