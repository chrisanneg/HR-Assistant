import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, 
  Eye, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Filter,
  Search,
  Calendar,
  User,
  Star,
  FileText,
  Trash2,
  Square,
  CheckSquare,
  X
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../ui/Button';
import axios from 'axios';

const TicketDashboard = () => {
  const { darkMode } = useTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  });

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  const statusConfig = {
    open: { 
      label: 'Open', 
      icon: Clock, 
      color: 'text-blue-500', 
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800'
    },
    in_progress: { 
      label: 'In Progress', 
      icon: AlertCircle, 
      color: 'text-yellow-500', 
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800'
    },
    resolved: { 
      label: 'Resolved', 
      icon: CheckCircle, 
      color: 'text-green-500', 
      bg: 'bg-green-100 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800'
    },
    closed: { 
      label: 'Closed', 
      icon: XCircle, 
      color: 'text-gray-500', 
      bg: 'bg-gray-100 dark:bg-gray-900/20',
      border: 'border-gray-200 dark:border-gray-800'
    }
  };

  const priorityConfig = {
    low: { color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' },
    medium: { color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
    high: { color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20' },
    urgent: { color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' }
  };

  const categoryIcons = {
    leave: Calendar,
    payroll: Star,
    policy: FileText,
    workplace: AlertCircle,
    performance: User,
    other: Clock
  };

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/tickets`);
      setTickets(response.data);
      
      // Calculate stats
      const stats = response.data.reduce((acc, ticket) => {
        acc.total++;
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
      }, { total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 });
      
      setStats(stats);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/tickets/${ticketId}/status`, {
        status: newStatus
      });
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const addTicketResponse = async (ticketId, response) => {
    try {
      await axios.post(`${API_BASE_URL}/api/tickets/${ticketId}/responses`, {
        response: response,
        responder: 'Admin'
      });
      fetchTickets();
    } catch (error) {
      console.error('Error adding response:', error);
    }
  };

  const deleteTicket = async (ticketId) => {
    try {
      const confirmed = window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.');
      if (!confirmed) return;

      await axios.delete(`${API_BASE_URL}/api/tickets/${ticketId}`);
      fetchTickets();
      setSelectedTicket(null); // Close modal if it's open
    } catch (error) {
      console.error('Error deleting ticket:', error);
      alert('Failed to delete ticket. Please try again.');
    }
  };

  const deleteMultipleTickets = async () => {
    try {
      const confirmed = window.confirm(`Are you sure you want to delete ${selectedTickets.length} ticket(s)? This action cannot be undone.`);
      if (!confirmed) return;

      // Use bulk delete endpoint for better performance
      await axios.delete(`${API_BASE_URL}/api/tickets/bulk`, {
        data: { ticket_ids: selectedTickets }
      });
      
      fetchTickets();
      setSelectedTickets([]);
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Error deleting tickets:', error);
      alert('Failed to delete some tickets. Please try again.');
    }
  };

  const toggleTicketSelection = (ticketId) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map(ticket => ticket.id));
    }
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedTickets([]);
  };

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = filter === 'all' || ticket.status === filter;
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.employee_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            HR Tickets
          </h1>
          <p className={`${darkMode ? 'text-dark-400' : 'text-gray-600'}`}>
            Manage employee tickets and requests
          </p>
        </div>
        
        {/* Selection Mode Controls */}
        <div className="flex items-center space-x-2">
          {isSelectionMode ? (
            <>
              <Button
                variant="outline"
                onClick={exitSelectionMode}
                icon={X}
                className="text-gray-600"
              >
                Cancel
              </Button>
              {selectedTickets.length > 0 && (
                <Button
                  variant="outline"
                  onClick={deleteMultipleTickets}
                  icon={Trash2}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  Delete Selected ({selectedTickets.length})
                </Button>
              )}
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsSelectionMode(true)}
              icon={CheckSquare}
            >
              Select Multiple
            </Button>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {Object.entries(stats).map(([key, value]) => {
          if (key === 'total') return null;
          const config = statusConfig[key];
          if (!config) return null;
          const IconComponent = config.icon;
          
          return (
            <div
              key={key}
              className={`${
                darkMode 
                  ? 'bg-dark-800/80 border-dark-700' 
                  : 'bg-white/80 border-gray-200'
              } backdrop-blur-lg border rounded-xl p-4 shadow-lg`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${config.bg}`}>
                  <IconComponent className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                  <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {value}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-dark-400' : 'text-gray-600'} capitalize`}>
                    {config.label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`${
          darkMode 
            ? 'bg-dark-800/80 border-dark-700' 
            : 'bg-white/80 border-gray-200'
        } backdrop-blur-lg border rounded-xl p-4 shadow-lg`}
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg transition-all duration-200 ${
                darkMode 
                  ? 'bg-dark-700 border-dark-600 text-white placeholder-dark-400 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`px-3 py-2 border rounded-lg transition-all duration-200 ${
                darkMode 
                  ? 'bg-dark-700 border-dark-600 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:ring-2 focus:ring-blue-500/20`}
            >
              <option value="all">All Tickets</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Select All in Selection Mode */}
          {isSelectionMode && filteredTickets.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleSelectAll}
                className={`flex items-center space-x-2 px-3 py-2 border rounded-lg transition-all duration-200 ${
                  darkMode 
                    ? 'bg-dark-700 border-dark-600 text-white hover:bg-dark-600' 
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                }`}
              >
                {selectedTickets.length === filteredTickets.length ? (
                  <CheckSquare className="w-4 h-4 text-blue-500" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {selectedTickets.length === filteredTickets.length ? 'Deselect All' : 'Select All'}
                </span>
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Tickets List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className={`${
            darkMode 
              ? 'bg-dark-800/80 border-dark-700' 
              : 'bg-white/80 border-gray-200'
          } backdrop-blur-lg border rounded-xl p-8 text-center shadow-lg`}>
            <Ticket className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-dark-400' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              No tickets found
            </p>
            <p className={`${darkMode ? 'text-dark-400' : 'text-gray-600'}`}>
              {searchTerm ? 'Try adjusting your search terms' : 'No tickets have been created yet'}
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const statusInfo = statusConfig[ticket.status];
            const StatusIcon = statusInfo?.icon || Clock;
            const priorityInfo = priorityConfig[ticket.priority];
            const CategoryIcon = categoryIcons[ticket.category] || FileText;

            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${
                  darkMode 
                    ? 'bg-dark-800/80 border-dark-700 hover:bg-dark-700/80' 
                    : 'bg-white/80 border-gray-200 hover:bg-gray-50/80'
                } backdrop-blur-lg border rounded-xl p-6 shadow-lg transition-all duration-200 cursor-pointer ${
                  selectedTickets.includes(ticket.id) ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                }`}
                onClick={() => {
                  if (isSelectionMode) {
                    toggleTicketSelection(ticket.id);
                  } else {
                    setSelectedTicket(ticket);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Selection Checkbox */}
                    {isSelectionMode && (
                      <div className="flex items-center pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTicketSelection(ticket.id);
                          }}
                          className="p-1"
                        >
                          {selectedTickets.includes(ticket.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CategoryIcon className="w-5 h-5 text-blue-500" />
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {ticket.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityInfo?.bg} ${priorityInfo?.color}`}>
                          {ticket.priority}
                        </span>
                      </div>

                      <p className={`${darkMode ? 'text-dark-400' : 'text-gray-600'} mb-3 line-clamp-2`}>
                        {ticket.description}
                      </p>

                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className={darkMode ? 'text-dark-300' : 'text-gray-700'}>
                            {ticket.employee_name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className={darkMode ? 'text-dark-300' : 'text-gray-700'}>
                            {formatDate(ticket.created_at)}
                          </span>
                        </div>
                        {ticket.responses && ticket.responses.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="w-4 h-4 text-gray-400" />
                            <span className={darkMode ? 'text-dark-300' : 'text-gray-700'}>
                              {ticket.responses.length} response{ticket.responses.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border ${statusInfo?.bg} ${statusInfo?.border}`}>
                      <StatusIcon className={`w-4 h-4 ${statusInfo?.color}`} />
                      <span className={`text-sm font-medium ${statusInfo?.color}`}>
                        {statusInfo?.label}
                      </span>
                    </div>

                    {!isSelectionMode && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicket(ticket);
                        }}
                      >
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onStatusUpdate={updateTicketStatus}
        onAddResponse={addTicketResponse}
        onDeleteTicket={deleteTicket}
      />
    </div>
  );
};

// Ticket Detail Modal Component
const TicketDetailModal = ({ ticket, onClose, onStatusUpdate, onAddResponse, onDeleteTicket }) => {
  const { darkMode } = useTheme();
  const [responseText, setResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  if (!ticket) return null;

  const statusConfig = {
    open: { label: 'Open', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20' },
    in_progress: { label: 'In Progress', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
    resolved: { label: 'Resolved', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' },
    closed: { label: 'Closed', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-900/20' }
  };

  const handleAddResponse = async () => {
    if (!responseText.trim()) return;
    
    setSubmittingResponse(true);
    try {
      await onAddResponse(ticket.id, responseText.trim());
      setResponseText('');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
          className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
            darkMode 
              ? 'bg-dark-800 border-dark-700' 
              : 'bg-white border-gray-200'
          } border rounded-2xl shadow-2xl`}
        >
          {/* Header */}
          <div className={`sticky top-0 ${
            darkMode ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
          } border-b p-6`}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  {ticket.title}
                </h2>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[ticket.status]?.bg} ${statusConfig[ticket.status]?.color}`}>
                    {statusConfig[ticket.status]?.label}
                  </span>
                  <span className={`text-sm ${darkMode ? 'text-dark-400' : 'text-gray-600'}`}>
                    Created by {ticket.employee_name} on {formatDate(ticket.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => onDeleteTicket(ticket.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  icon={Trash2}
                >
                  Delete
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Ticket Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-dark-300' : 'text-gray-700'} mb-1`}>
                  Priority
                </label>
                <span className={`px-2 py-1 rounded text-sm font-medium bg-${ticket.priority === 'urgent' ? 'red' : ticket.priority === 'high' ? 'orange' : ticket.priority === 'medium' ? 'yellow' : 'green'}-100`}>
                  {ticket.priority}
                </span>
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-dark-300' : 'text-gray-700'} mb-1`}>
                  Category
                </label>
                <span className={`${darkMode ? 'text-white' : 'text-gray-900'} capitalize`}>
                  {ticket.category}
                </span>
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-dark-300' : 'text-gray-700'} mb-1`}>
                  Department
                </label>
                <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {ticket.department || 'Not specified'}
                </span>
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-dark-300' : 'text-gray-700'} mb-1`}>
                  Status
                </label>
                <select
                  value={ticket.status}
                  onChange={(e) => onStatusUpdate(ticket.id, e.target.value)}
                  className={`px-3 py-1 border rounded text-sm ${
                    darkMode 
                      ? 'bg-dark-700 border-dark-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                Description
              </h3>
              <div className={`${
                darkMode ? 'bg-dark-700 border-dark-600' : 'bg-gray-50 border-gray-200'
              } border rounded-lg p-4`}>
                <p className={`${darkMode ? 'text-dark-300' : 'text-gray-700'} whitespace-pre-wrap`}>
                  {ticket.description}
                </p>
              </div>
            </div>

            {/* Responses */}
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                Responses ({ticket.responses?.length || 0})
              </h3>
              
              <div className="space-y-3">
                {ticket.responses?.map((response, index) => (
                  <div
                    key={index}
                    className={`${
                      darkMode ? 'bg-dark-700 border-dark-600' : 'bg-gray-50 border-gray-200'
                    } border rounded-lg p-4`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {response.responder}
                      </span>
                      <span className={`text-sm ${darkMode ? 'text-dark-400' : 'text-gray-600'}`}>
                        {formatDate(response.created_at)}
                      </span>
                    </div>
                    <p className={`${darkMode ? 'text-dark-300' : 'text-gray-700'} whitespace-pre-wrap`}>
                      {response.response}
                    </p>
                  </div>
                ))}
              </div>

              {/* Add Response */}
              <div className="mt-4">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Add a response..."
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg resize-none transition-all duration-200 ${
                    darkMode 
                      ? 'bg-dark-700 border-dark-600 text-white placeholder-dark-400 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500/20`}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleAddResponse}
                    disabled={!responseText.trim() || submittingResponse}
                    loading={submittingResponse}
                    variant="primary"
                    size="sm"
                  >
                    Add Response
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TicketDashboard;