import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../ui/Button';
import axios from 'axios';

const FileUpload = ({ onUploadSuccess }) => {
  const { darkMode } = useTheme();
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [uploadMessage, setUploadMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setUploadStatus('error');
      setUploadMessage('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setUploadStatus('idle');
      setUploadMessage('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('error');
      setUploadMessage('Please select a file first');
      return;
    }

    setUploadStatus('uploading');
    setUploadMessage('Uploading and processing file...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      await axios.post(`${API_BASE_URL}/api/admin/upload-policy`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadStatus('success');
      setUploadMessage('File uploaded successfully!');
      setSelectedFile(null);
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }

      // Reset status after 3 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadMessage('');
      }, 3000);

    } catch (error) {
      setUploadStatus('error');
      setUploadMessage(
        error.response?.data?.detail || 'Failed to upload file. Please try again.'
      );
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadMessage('');
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <motion.div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
          ${isDragActive 
            ? darkMode
              ? 'border-blue-400 bg-blue-400/10'
              : 'border-blue-500 bg-blue-50'
            : uploadStatus === 'error'
              ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
              : darkMode
                ? 'border-dark-600 hover:border-dark-500 bg-dark-700/50'
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }
        `}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input {...getInputProps()} />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-4"
        >
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
            isDragActive 
              ? 'bg-blue-500' 
              : uploadStatus === 'error'
                ? 'bg-red-500'
                : darkMode
                  ? 'bg-dark-600'
                  : 'bg-gray-200'
          }`}>
            {uploadStatus === 'error' ? (
              <AlertCircle className="w-8 h-8 text-white" />
            ) : (
              <Upload className={`w-8 h-8 ${
                isDragActive ? 'text-white' : darkMode ? 'text-dark-300' : 'text-gray-500'
              }`} />
            )}
          </div>
          
          <div>
            <p className={`text-lg font-medium ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {isDragActive 
                ? 'Drop the file here...' 
                : 'Drag & drop an Excel file here'
              }
            </p>
            <p className={`text-sm ${darkMode ? 'text-dark-400' : 'text-gray-500'}`}>
              or click to browse • .xlsx, .xls files only
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Selected File */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`${
              darkMode 
                ? 'bg-dark-700 border-dark-600' 
                : 'bg-gray-50 border-gray-200'
            } border rounded-lg p-4`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedFile.name}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-dark-400' : 'text-gray-500'}`}>
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={clearFile}
                className={`p-1 rounded-full ${
                  darkMode 
                    ? 'hover:bg-dark-600 text-dark-400 hover:text-white' 
                    : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Button */}
      <div className="flex space-x-3">
        <Button
          onClick={handleUpload}
          disabled={!selectedFile}
          loading={uploadStatus === 'uploading'}
          variant="primary"
          className="flex-1"
        >
          Upload Policy Document
        </Button>
      </div>

      {/* Status Message */}
      <AnimatePresence>
        {uploadMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center space-x-2 p-3 rounded-lg ${
              uploadStatus === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : uploadStatus === 'error'
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
            }`}
          >
            {uploadStatus === 'success' && <CheckCircle className="w-5 h-5" />}
            {uploadStatus === 'error' && <AlertCircle className="w-5 h-5" />}
            {uploadStatus === 'uploading' && (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            <span>{uploadMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;