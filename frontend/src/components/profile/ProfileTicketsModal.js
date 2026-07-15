import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Filter, MessageSquare, Send, Ticket, User, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../ui/Button';

const priorityOrder = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const priorityConfig = {
  low: { label: 'Low', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' },
  medium: { label: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
  high: { label: 'High', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20' },
  urgent: { label: 'Urgent', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' },
};

const statusConfig = {
  open: { label: 'Open', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20' },
  in_progress: { label: 'In Progress', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
  resolved: { label: 'Resolved', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' },
  closed: { label: 'Closed', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-900/20' },
};

const adminPriorityOptions = ['all', 'urgent', 'high', 'medium', 'low'];

const ProfileTicketsModal = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();
  const { darkMode } = useTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [actionError, setActionError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/tickets`);
      const sortedTickets = [...response.data].sort((a, b) => {
        const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setTickets(sortedTickets);
      setSelectedTicket(prev => {
        if (!prev) return sortedTickets[0] || null;
        return sortedTickets.find(ticket => ticket.id === prev.id) || sortedTickets[0] || null;
      });
    } catch (error) {
      console.error('Error fetching profile tickets:', error);
      setActionError('Unable to load tickets right now.');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
    } else {
      setSelectedTicket(null);
      setReplyText('');
      setPriorityFilter('all');
      setStatusFilter('all');
      setActionError('');
    }
  }, [isOpen, fetchTickets]);

  const visibleTickets = useMemo(() => {
    const currentUserTickets = tickets.filter(ticket => {
      if (isAdmin) return true;
      const matchesUserId = user?.id && ticket.employee_id === user.id;
      const matchesUsername = user?.username && ticket.employee_name === user.username;
      const matchesGuest = user?.isGuest && ticket.employee_id === 'guest';
      return matchesUserId || matchesUsername || matchesGuest;
    });

    return currentUserTickets.filter(ticket => {
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = !isAdmin || priorityFilter === 'all' || ticket.priority === priorityFilter;
      return matchesStatus && matchesPriority;
    });
  }, [tickets, isAdmin, priorityFilter, statusFilter, user]);

  useEffect(() => {
    if (!selectedTicket && visibleTickets.length > 0) {
      setSelectedTicket(visibleTickets[0]);
    }
  }, [visibleTickets, selectedTicket]);

  const handleAddReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;

    try {
      setSubmittingReply(true);
      setActionError('');
      await axios.post(`${API_BASE_URL}/api/tickets/${selectedTicket.id}/responses`, {
        response: replyText.trim(),
        responder: isAdmin ? 'Admin' : user?.username || 'User',
      });
      setReplyText('');
      await fetchTickets();
      setSelectedTicket(prev => prev ? {
        ...prev,
        responses: [...(prev.responses || []), {
          response: replyText.trim(),
          responder: isAdmin ? 'Admin' : user?.username || 'User',
          created_at: new Date().toISOString(),
        }]
      } : prev);
    } catch (error) {
      console.error('Error adding ticket reply:', error);
      setActionError('Failed to add reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    if (!selectedTicket) return;
    try {
      setActionError('');
      await axios.patch(`${API_BASE_URL}/api/tickets/${selectedTicket.id}/status`, { status });
      await fetchTickets();
      setSelectedTicket(prev => prev ? { ...prev, status } : prev);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      setActionError('Failed to update ticket status.');
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          onClick={(event) => event.stopPropagation()}
          className={`w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl border shadow-2xl ${
            darkMode ? 'border-dark-700 bg-dark-800' : 'border-gray-200 bg-white'
          }`}
        >
          <div className={`flex items-center justify-between border-b px-6 py-4 ${darkMode ? 'border-dark-700' : 'border-gray-200'}`}>
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 p-2 text-white shadow-lg">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {isAdmin ? 'Ticket Center' : 'My Tickets'}
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-dark-400' : 'text-gray-600'}`}>
                    {isAdmin ? 'View tickets by priority and respond to employees' : 'View your submitted tickets and HR replies'}
                  </p>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={onClose} icon={X}>
              Close
            </Button>
          </div>

          <div className="grid h-[calc(90vh-72px)] grid-cols-1 lg:grid-cols-[380px_1fr]">
            <div className={`border-r p-4 ${darkMode ? 'border-dark-700 bg-dark-800/70' : 'border-gray-200 bg-gray-50/70'}`}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {visibleTickets.length} ticket{visibleTickets.length !== 1 ? 's' : ''}
                  </h3>
                  <p className={`text-xs ${darkMode ? 'text-dark-400' : 'text-gray-500'}`}>
                    Sorted by priority and recency
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchTickets}>
                  Refresh
                </Button>
              </div>

              <div className="mb-4 space-y-3">
                <div className={`flex items-center gap-2 text-sm font-medium ${darkMode ? 'text-dark-300' : 'text-gray-700'}`}>
                  <Filter className="h-4 w-4" />
                  Filters
                </div>
                <div className="flex flex-wrap gap-2">
                  {isAdmin && adminPriorityOptions.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPriorityFilter(option)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        priorityFilter === option
                          ? 'bg-blue-600 text-white'
                          : darkMode
                            ? 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                      } border ${darkMode ? 'border-dark-600' : 'border-gray-200'}`}
                    >
                      {option === 'all' ? 'All Priority' : option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {['all', 'open', 'in_progress', 'resolved', 'closed'].map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setStatusFilter(option)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        statusFilter === option
                          ? 'bg-purple-600 text-white'
                          : darkMode
                            ? 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                      } border ${darkMode ? 'border-dark-600' : 'border-gray-200'}`}
                    >
                      {option === 'all' ? 'All Status' : option.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 'calc(90vh - 280px)' }}>
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
                  </div>
                ) : visibleTickets.length === 0 ? (
                  <div className={`rounded-xl border p-4 text-center ${darkMode ? 'border-dark-700 bg-dark-700/40 text-dark-300' : 'border-gray-200 bg-white text-gray-600'}`}>
                    <Ticket className="mx-auto mb-3 h-10 w-10 opacity-60" />
                    <p className="font-medium">No tickets found</p>
                    <p className="mt-1 text-sm opacity-80">Try a different filter or create a new request from chat.</p>
                  </div>
                ) : (
                  visibleTickets.map(ticket => {
                    const priorityInfo = priorityConfig[ticket.priority] || priorityConfig.medium;
                    const statusInfo = statusConfig[ticket.status] || statusConfig.open;
                    const isSelected = selectedTicket?.id === ticket.id;

                    return (
                      <motion.button
                        key={ticket.id}
                        whileHover={{ scale: 1.01 }}
                        type="button"
                        onClick={() => setSelectedTicket(ticket)}
                        className={`w-full rounded-xl border p-4 text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 ring-2 ring-blue-500/30'
                            : darkMode
                              ? 'border-dark-700 bg-dark-700/60 hover:bg-dark-700'
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {ticket.title}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-dark-400' : 'text-gray-500'}`}>
                              {ticket.employee_name} · {formatDate(ticket.created_at)}
                            </p>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${priorityInfo.bg} ${priorityInfo.color}`}>
                            {priorityInfo.label}
                          </span>
                        </div>
                        <p className={`line-clamp-2 text-sm ${darkMode ? 'text-dark-300' : 'text-gray-600'}`}>
                          {ticket.description}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-xs ${darkMode ? 'text-dark-400' : 'text-gray-500'}`}>
                            <MessageSquare className="h-3.5 w-3.5" />
                            {ticket.responses?.length || 0} responses
                          </span>
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>
            </div>

            <div className={`flex flex-col ${darkMode ? 'bg-dark-800' : 'bg-white'}`}>
              {!selectedTicket ? (
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div>
                    <User className={`mx-auto mb-3 h-12 w-12 ${darkMode ? 'text-dark-500' : 'text-gray-400'}`} />
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Select a ticket to view details
                    </p>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-dark-400' : 'text-gray-500'}`}>
                      Replies from HR appear here, along with the ticket conversation.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col">
                  <div className={`border-b px-6 py-5 ${darkMode ? 'border-dark-700' : 'border-gray-200'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedTicket.title}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusConfig[selectedTicket.status]?.bg} ${statusConfig[selectedTicket.status]?.color}`}>
                            {statusConfig[selectedTicket.status]?.label}
                          </span>
                          <span className={`inline-flex items-center gap-1 ${darkMode ? 'text-dark-400' : 'text-gray-600'}`}>
                            <Calendar className="h-4 w-4" />
                            {formatDate(selectedTicket.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <select
                            value={selectedTicket.priority}
                            onChange={(event) => {
                              const nextPriority = event.target.value;
                              setSelectedTicket(prev => prev ? { ...prev, priority: nextPriority } : prev);
                            }}
                            className={`rounded-lg border px-3 py-2 text-sm ${
                              darkMode ? 'border-dark-600 bg-dark-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                            }`}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        )}
                        {isAdmin && (
                          <select
                            value={selectedTicket.status}
                            onChange={(event) => handleStatusUpdate(event.target.value)}
                            className={`rounded-lg border px-3 py-2 text-sm ${
                              darkMode ? 'border-dark-600 bg-dark-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                            }`}
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        )}
                      </div>
                    </div>
                    <p className={`mt-2 text-sm ${darkMode ? 'text-dark-400' : 'text-gray-600'}`}>
                      Created by {selectedTicket.employee_name} · Department: {selectedTicket.department || 'Not specified'}
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {actionError && (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                        {actionError}
                      </div>
                    )}

                    <div>
                      <h4 className={`mb-2 text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Description
                      </h4>
                      <div className={`rounded-xl border p-4 ${darkMode ? 'border-dark-700 bg-dark-700/70' : 'border-gray-200 bg-gray-50'}`}>
                        <p className={`whitespace-pre-wrap ${darkMode ? 'text-dark-200' : 'text-gray-700'}`}>
                          {selectedTicket.description}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Admin Replies ({selectedTicket.responses?.length || 0})
                        </h4>
                      </div>

                      <div className="space-y-3">
                        {selectedTicket.responses?.length > 0 ? (
                          selectedTicket.responses.map((response, index) => (
                            <div
                              key={`${response.id || index}`}
                              className={`rounded-xl border p-4 ${darkMode ? 'border-dark-700 bg-dark-700/70' : 'border-gray-200 bg-white'}`}
                            >
                              <div className="mb-2 flex items-center justify-between gap-4">
                                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {response.responder}
                                </span>
                                <span className={`text-xs ${darkMode ? 'text-dark-400' : 'text-gray-500'}`}>
                                  {formatDate(response.created_at)}
                                </span>
                              </div>
                              <p className={`whitespace-pre-wrap text-sm ${darkMode ? 'text-dark-200' : 'text-gray-700'}`}>
                                {response.response}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className={`rounded-xl border border-dashed p-5 text-sm ${darkMode ? 'border-dark-700 text-dark-400' : 'border-gray-200 text-gray-500'}`}>
                            No replies yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className={`border-t px-6 py-5 ${darkMode ? 'border-dark-700' : 'border-gray-200'}`}>
                      <label className={`mb-2 block text-sm font-medium ${darkMode ? 'text-dark-300' : 'text-gray-700'}`}>
                        Reply to employee
                      </label>
                      <textarea
                        value={replyText}
                        onChange={(event) => setReplyText(event.target.value)}
                        rows={3}
                        placeholder="Write your response..."
                        className={`w-full resize-none rounded-xl border px-4 py-3 text-sm transition-all ${
                          darkMode
                            ? 'border-dark-600 bg-dark-700 text-white placeholder-dark-400'
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                        }`}
                      />
                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="primary"
                          onClick={handleAddReply}
                          loading={submittingReply}
                          disabled={!replyText.trim()}
                          icon={Send}
                        >
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileTicketsModal;
