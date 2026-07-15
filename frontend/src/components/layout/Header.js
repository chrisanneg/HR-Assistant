import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Shield, 
  Moon, 
  Sun, 
  LogOut, 
  User,
  Bot
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import TextType from '../ui/TextType';

const Header = ({ currentView, setCurrentView, onOpenProfile }) => {
  const { user, logout, isAdmin } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`${
        darkMode 
          ? 'bg-dark-800/90 border-dark-700' 
          : 'bg-white/90 border-gray-200'
      } backdrop-blur-lg border-b sticky top-0 z-50 transition-all duration-300`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className={`p-2 rounded-xl ${
              darkMode 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            } shadow-lg`}>
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                HR Policy Assistant
              </h1>
              <div className={`text-sm ${
                darkMode ? 'text-dark-400' : 'text-gray-500'
              }`}>
                <TextType 
                  text="Powered by Chrisanne, Jhai, Abhishek and Sanika" 
                  speed={80}
                  color="inherit"
                  showCursor={true}
                />
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {/* View Toggle Buttons */}
            <div className={`flex rounded-lg p-1 ${
              darkMode ? 'bg-dark-700' : 'bg-gray-100'
            }`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('chat')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                  currentView === 'chat'
                    ? darkMode
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-blue-500 text-white shadow-lg'
                    : darkMode
                      ? 'text-dark-300 hover:text-white hover:bg-dark-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">Chat</span>
              </motion.button>
              
              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentView('admin')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                    currentView === 'admin'
                      ? darkMode
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-purple-500 text-white shadow-lg'
                      : darkMode
                        ? 'text-dark-300 hover:text-white hover:bg-dark-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Admin</span>
                </motion.button>
              )}
            </div>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all duration-200 ${
                darkMode 
                  ? 'bg-dark-700 text-yellow-400 hover:bg-dark-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {/* User Menu */}
            <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${
              darkMode ? 'bg-dark-700' : 'bg-gray-100'
            }`}>
              <div className={`p-1.5 rounded-full ${
                isAdmin 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}>
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className={`text-sm font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {user?.username}
                </p>
                <p className={`text-xs ${
                  darkMode ? 'text-dark-400' : 'text-gray-500'
                }`}>
                  {isAdmin ? 'Administrator' : 'User'}
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenProfile}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                darkMode
                  ? 'bg-dark-700 text-dark-200 hover:bg-dark-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Profile
            </motion.button>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className={`p-2 rounded-lg transition-all duration-200 ${
                darkMode 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              } shadow-lg`}
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;