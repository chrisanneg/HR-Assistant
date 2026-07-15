import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Shield, Eye, EyeOff, Bot, Sparkles, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import AnimatedLoginTitle from '../ui/AnimatedLoginTitle';
import SplashCursor from '../ui/SplashCursor';

const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    isAdmin: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register, loginAsGuest } = useAuth();
  const { darkMode } = useTheme();

  const handleGuestAccess = () => {
    // Login as guest to access chat without authentication
    loginAsGuest();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.username, formData.password);
      } else {
        result = await register(formData.username, formData.password, formData.isAdmin);
        if (result.success) {
          // Auto-login after successful registration
          result = await login(formData.username, formData.password);
        }
      }

      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      darkMode 
        ? 'bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
            {/* Fluid Cursor Effect */}
      <SplashCursor 
        DENSITY_DISSIPATION={1.8}
        VELOCITY_DISSIPATION={0.8}
        PRESSURE={0.8}
        CURL={15}
        SPLAT_RADIUS={0.25}
        SPLAT_FORCE={3000}
        SHADING={true}
        COLOR_UPDATE_SPEED={8}
        TRANSPARENT={true}
      />
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg mb-4"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Bot className="w-8 h-8 text-white" />
          </motion.div>
          
          <AnimatedLoginTitle 
            darkMode={darkMode}
            className={`text-3xl font-bold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
          />
          
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <p className={`${darkMode ? 'text-dark-400' : 'text-gray-600'}`}>
              Powered by Gemini AI
            </p>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
        </motion.div>

        {/* Form Container */}
        <motion.div
          className={`${
            darkMode 
              ? 'bg-dark-800/80 border-dark-700' 
              : 'bg-white/80 border-gray-200'
          } backdrop-blur-lg border rounded-2xl p-8 shadow-2xl`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Toggle Buttons */}
          <div className={`flex rounded-lg p-1 mb-6 ${
            darkMode ? 'bg-dark-700' : 'bg-gray-100'
          }`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                isLogin
                  ? darkMode
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-blue-500 text-white shadow-lg'
                  : darkMode
                    ? 'text-dark-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                !isLogin
                  ? darkMode
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-purple-500 text-white shadow-lg'
                  : darkMode
                    ? 'text-dark-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </motion.button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
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

            <Input
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              icon={User}
              placeholder="Enter your username"
              required
            />

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                icon={Lock}
                placeholder="Enter your password"
                required
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-dark-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </motion.button>
            </div>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center space-x-3"
              >
                <input
                  type="checkbox"
                  id="isAdmin"
                  name="isAdmin"
                  checked={formData.isAdmin}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label 
                  htmlFor="isAdmin" 
                  className={`flex items-center space-x-2 text-sm font-medium ${
                    darkMode ? 'text-dark-300' : 'text-gray-700'
                  }`}
                >
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span>Register as Administrator</span>
                </label>
              </motion.div>
            )}

            <Button
              type="submit"
              variant={isLogin ? 'primary' : 'success'}
              size="lg"
              loading={loading}
              className="w-full"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>

            {/* Guest Access Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleGuestAccess}
                className="w-full mt-3"
                icon={MessageCircle}
              >
                Continue as Guest
              </Button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className={`text-sm ${darkMode ? 'text-dark-400' : 'text-gray-600'}`}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </motion.button>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
