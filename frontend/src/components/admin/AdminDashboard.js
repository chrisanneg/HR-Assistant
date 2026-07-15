import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Calendar, User, Shield, Ticket, BarChart3 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import FileUpload from './FileUpload';
import PolicyList from './PolicyList';
import TicketDashboard from '../tickets/TicketDashboard';
import axios from 'axios';

const AdminDashboard = () => {
  const { darkMode } = useTheme();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalPolicies: 0,
    lastUpload: null,
  });

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/policies`);
      setPolicies(response.data);
      setStats({
        totalPolicies: response.data.length,
        lastUpload: response.data.length > 0 
          ? new Date(Math.max(...response.data.map(p => new Date(p.uploaded_at))))
          : null
      });
    } catch (error) {
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const handleUploadSuccess = () => {
    fetchPolicies();
  };

  const handleDeletePolicy = async (policyId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/policies/${policyId}`);
      fetchPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
    }
  };

  const renderOverviewTab = () => (
    <>
      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className={`${
          darkMode 
            ? 'bg-dark-800/80 border-dark-700' 
            : 'bg-white/80 border-gray-200'
        } backdrop-blur-lg border rounded-xl p-6 shadow-lg`}>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-dark-400' : 'text-gray-600'}`}>
                Total Policies
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalPolicies}
              </p>
            </div>
          </div>
        </div>

        <div className={`${
          darkMode 
            ? 'bg-dark-800/80 border-dark-700' 
            : 'bg-white/80 border-gray-200'
        } backdrop-blur-lg border rounded-xl p-6 shadow-lg`}>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-dark-400' : 'text-gray-600'}`}>
                Last Upload
              </p>
              <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.lastUpload 
                  ? stats.lastUpload.toLocaleDateString()
                  : 'No uploads yet'
                }
              </p>
            </div>
          </div>
        </div>

        <div className={`${
          darkMode 
            ? 'bg-dark-800/80 border-dark-700' 
            : 'bg-white/80 border-gray-200'
        } backdrop-blur-lg border rounded-xl p-6 shadow-lg`}>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-dark-400' : 'text-gray-600'}`}>
                System Status
              </p>
              <p className="text-lg font-semibold text-green-500">
                Active
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`${
          darkMode 
            ? 'bg-dark-800/80 border-dark-700' 
            : 'bg-white/80 border-gray-200'
        } backdrop-blur-lg border rounded-xl p-6 shadow-lg`}
      >
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('policies')}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              darkMode
                ? 'border-dark-600 hover:border-blue-500 bg-dark-700 hover:bg-dark-600'
                : 'border-gray-200 hover:border-blue-500 bg-white hover:bg-blue-50'
            }`}
          >
            <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Upload Policy
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('tickets')}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              darkMode
                ? 'border-dark-600 hover:border-purple-500 bg-dark-700 hover:bg-dark-600'
                : 'border-gray-200 hover:border-purple-500 bg-white hover:bg-purple-50'
            }`}
          >
            <Ticket className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Manage Tickets
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('policies')}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              darkMode
                ? 'border-dark-600 hover:border-green-500 bg-dark-700 hover:bg-dark-600'
                : 'border-gray-200 hover:border-green-500 bg-white hover:bg-green-50'
            }`}
          >
            <FileText className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              View Policies
            </p>
          </motion.button>
        </div>
      </motion.div>
    </>
  );

  const renderPoliciesTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* File Upload Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className={`${
          darkMode 
            ? 'bg-dark-800/80 border-dark-700' 
            : 'bg-white/80 border-gray-200'
        } backdrop-blur-lg border rounded-xl p-6 shadow-lg h-fit`}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Upload HR Policy
              </h2>
              <p className={`text-sm ${darkMode ? 'text-dark-400' : 'text-gray-600'}`}>
                Upload Excel files containing HR policies
              </p>
            </div>
          </div>

          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>
      </motion.div>

      {/* Policy List Section */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className={`${
          darkMode 
            ? 'bg-dark-800/80 border-dark-700' 
            : 'bg-white/80 border-gray-200'
        } backdrop-blur-lg border rounded-xl p-6 shadow-lg`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Policy Documents
                </h2>
                <p className={`text-sm ${darkMode ? 'text-dark-400' : 'text-gray-600'}`}>
                  Manage uploaded policy documents
                </p>
              </div>
            </div>
          </div>

          <PolicyList 
            policies={policies} 
            onDelete={handleDeletePolicy}
            loading={loading}
          />
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className={`p-3 rounded-xl ${
            darkMode 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500'
          } shadow-lg`}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Admin Dashboard
            </h1>
            <p className={`${darkMode ? 'text-dark-400' : 'text-gray-600'}`}>
              Manage HR policies, tickets, and system settings
            </p>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${
          darkMode 
            ? 'bg-dark-800/80 border-dark-700' 
            : 'bg-white/80 border-gray-200'
        } backdrop-blur-lg border rounded-xl p-2 shadow-lg`}
      >
        <div className="flex space-x-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'policies', label: 'Policies', icon: FileText },
            { id: 'tickets', label: 'Tickets', icon: Ticket }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? darkMode
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-blue-500 text-white shadow-lg'
                    : darkMode
                      ? 'text-dark-400 hover:text-white hover:bg-dark-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {renderOverviewTab()}
          </motion.div>
        )}
        
        {activeTab === 'policies' && (
          <motion.div
            key="policies"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {renderPoliciesTab()}
          </motion.div>
        )}
        
        {activeTab === 'tickets' && (
          <motion.div
            key="tickets"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <TicketDashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
