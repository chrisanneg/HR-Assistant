import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoginScreen from './auth/LoginScreen';
import AdminDashboard from './admin/AdminDashboard';
import ChatInterface from './chat/ChatInterface';
import Header from './layout/Header';
import ProfileTicketsModal from './profile/ProfileTicketsModal';
import LoadingSpinner from './ui/LoadingSpinner';

const MainApp = () => {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const { darkMode } = useTheme();
  const [currentView, setCurrentView] = useState('chat');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenProfile={() => setIsProfileOpen(true)}
      />
      
      <main className="max-w-4xl w-full mx-auto px-4 py-6">

        <AnimatePresence mode="wait">
          {currentView === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ChatInterface />
            </motion.div>
          )}
          
          {currentView === 'admin' && isAdmin && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AdminDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ProfileTicketsModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};

export default MainApp;