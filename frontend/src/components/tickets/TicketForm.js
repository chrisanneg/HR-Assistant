import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, Clock, Star, User, FileText, Calendar } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import axios from 'axios';

const TicketForm = ({ isOpen, onClose, onTicketCreated, initialData = null }) => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData(prev => ({
        ...prev,
        title: initialData.title ?? prev.title,
        description: initialData.description ?? prev.description,
        category: initialData.category ?? prev.category,
        priority: initialData.priority ?? prev.priority,
        department: initialData.department ?? prev.department
      }));
    } else {
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        department: ''
      });
    }
    setError('');
  }, [isOpen, initialData]);

  const categories = [
    { value: 'leave', label: 'Leave & Time Off', icon: Calendar },
    { value: 'payroll', label: 'Payroll & Benefits', icon: Star },
    { value: 'policy', label: 'Policy Questions', icon: FileText },
    { value: 'workplace', label: 'Workplace Issues', icon: AlertCircle },
    { value: 'performance', label: 'Performance Review', icon: User },
    { value: 'other', label: 'Other', icon: Clock }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
    { value: 'high', label: 'High', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' }
  ];

  const departments = [
    'Human Resources',
    'IT Support',
    'Finance',
    'Operations',
    'Management',
    'Legal',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/tickets`, {
        ...formData,
        employee_name: user?.username || 'Guest',
        employee_id: user?.id || 'guest'
      });

      onTicketCreated?.(response.data);
      
      onClose();
    } catch (error) {
      console.error('Error creating ticket:', error);
      if (error.response) {
        // Server responded with error status
        setError(error.response.data?.detail || `Server Error: ${error.response.status}`);
      } else if (error.request) {
        // Request was made but no response received
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        // Something else happened
        setError('Failed to create ticket. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClose = () => {
    onClose();
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
          className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
            darkMode 
              ? 'bg-dark-800 border-dark-700' 
              : 'bg-white border-gray-200'
          } border rounded-2xl shadow-2xl`}
        >
          {/* Header */}
          <div className={`sticky top-0 ${
            darkMode ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
          } border-b p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Create HR Ticket
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-dark-400' : 'text-gray-600'}`}>
                    Submit your HR request or concern
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'hover:bg-dark-700 text-dark-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Title */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-dark-300' : 'text-gray-700'
              }`}>
                Ticket Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief description of your request"
                required
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                  darkMode 
                    ? 'bg-dark-700 border-dark-600 text-white placeholder-dark-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>

            {/* Category */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                darkMode ? 'text-dark-300' : 'text-gray-700'
              }`}>
                Category *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <motion.button
                      key={category.value}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.category === category.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : darkMode
                            ? 'border-dark-600 hover:border-dark-500 bg-dark-700'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 mx-auto mb-2 ${
                        formData.category === category.value ? 'text-blue-500' : darkMode ? 'text-dark-400' : 'text-gray-500'
                      }`} />
                      <p className={`text-xs font-medium ${
                        formData.category === category.value 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : darkMode ? 'text-dark-300' : 'text-gray-700'
                      }`}>
                        {category.label}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Priority and Department Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Priority */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-dark-300' : 'text-gray-700'
                }`}>
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                    darkMode 
                      ? 'bg-dark-700 border-dark-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500/20`}
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-dark-300' : 'text-gray-700'
                }`}>
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                    darkMode 
                      ? 'bg-dark-700 border-dark-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500/20`}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-dark-300' : 'text-gray-700'
              }`}>
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Please provide detailed information about your request or concern..."
                required
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg resize-none transition-all duration-200 ${
                  darkMode 
                    ? 'bg-dark-700 border-dark-600 text-white placeholder-dark-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={!formData.title.trim() || !formData.description.trim() || !formData.category}
                icon={Send}
              >
                Create Ticket
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TicketForm;