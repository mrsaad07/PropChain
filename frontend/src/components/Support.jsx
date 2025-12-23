import React, { useState, useEffect } from 'react';
import { extrasAPI } from '../services/api';
import { toast } from 'react-toastify';

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({ subject: '', description: '', priority: 'medium' });
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await extrasAPI.getMyTickets();
      setTickets(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await extrasAPI.createTicket(formData);
      toast.success("Ticket created!");
      setFormData({ subject: '', description: '', priority: 'medium' });
      fetchTickets();
    } catch (error) {
      toast.error("Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Ticket Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Create Support Ticket</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
            <input 
              type="text" 
              required
              value={formData.subject}
              onChange={e => setFormData({...formData, subject: e.target.value})}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea 
              required
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={e => setFormData({...formData, priority: e.target.value})}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>
        </form>
      </div>

      {/* Ticket List */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">My Tickets</h2>
        {tickets.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No tickets yet.</p>
        ) : (
          <div className="space-y-4">
            {tickets.map(t => (
              <div key={t._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-gray-200">{t.subject}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.description}</p>
                  <span className={`text-xs px-2 py-1 rounded mt-2 inline-block ${
                    t.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {t.priority}
                  </span>
                </div>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;
