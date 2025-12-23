import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { extrasAPI } from '../services/api';
import { Send, User as UserIcon, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const Chat = ({ contactWallet, onClose }) => {
  const { account } = useBlockchain();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await extrasAPI.getMessages(contactWallet);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setLoading(false);
    }
  }, [contactWallet]);

  useEffect(() => {
    if (contactWallet) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [contactWallet, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    let payload = {
        receiver: contactWallet,
        content: newMessage
    };

    // Check for offer command
    // Syntax: /offer 12000
    if (newMessage.trim().startsWith('/offer ')) {
        const parts = newMessage.trim().split(' ');
        if (parts.length === 2 && !isNaN(parts[1])) {
            const amount = parseFloat(parts[1]);
            payload.isOffer = true;
            payload.offerAmount = amount;
            payload.content = `OFFER: ${amount} TL`; // Override text content for display compatibility
        } else {
            return toast.warning("Invalid offer format. Use: /offer [amount]");
        }
    }

    try {
      await extrasAPI.sendMessage(payload);
      setNewMessage('');
      fetchMessages(); // Refresh immediately
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleRespond = async (messageId, status) => {
      try {
          await extrasAPI.respondToOffer({ messageId, status });
          toast.success(`Offer ${status}!`);
          fetchMessages();
      } catch (error) {
          toast.error("Action failed.");
      }
  };

  const formatLastActive = (date) => {
    if (!date) return 'Offline';
    const diff = Date.now() - new Date(date).getTime();
    if (diff < 5 * 60 * 1000) return 'Online';
    if (diff < 60 * 60 * 1000) return `Active ${Math.floor(diff / 60000)}m ago`;
    if (diff < 24 * 60 * 60 * 1000) return `Active ${Math.floor(diff / 3600000)}h ago`;
    return `Active ${Math.floor(diff / 86400000)}d ago`;
  };

  if (!contactWallet) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-800 p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-400 dark:bg-blue-600 p-1.5 rounded-full relative">
            <UserIcon size={16} />
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border border-white rounded-full"></span>
          </div>
          <div>
            <p className="font-bold text-sm">Chat</p>
            <div className="text-xs text-blue-100 font-mono flex flex-col">
               <span>{contactWallet.substring(0, 6)}...{contactWallet.substring(contactWallet.length - 4)}</span>
               <span className="text-[10px] opacity-80">{formatLastActive(new Date())}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-blue-700 dark:hover:bg-blue-900 p-1 rounded">✕</button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 space-y-3">
        {loading ? (
          <div className="text-center text-gray-400 text-sm mt-10">Loading conversation...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-10">
            No messages yet.<br/>Type <code>/offer [amount]</code> to make an offer!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = account && msg.sender?.toLowerCase() === account.toLowerCase();
            return (
              <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl p-3 text-sm ${
                  isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-bl-none'
                }`}>
                  {msg.isOffer ? (
                      <div className="flex flex-col gap-2">
                          <p className="font-bold text-lg">{msg.offerAmount} TL Offer</p>
                          <div className={`text-xs px-2 py-1 rounded-full w-fit ${
                              msg.offerStatus === 'pending' ? 'bg-yellow-500 text-white' : 
                              msg.offerStatus === 'accepted' ? 'bg-green-500 text-white' : 
                              'bg-red-500 text-white'
                          }`}>
                              {msg.offerStatus.toUpperCase()}
                          </div>
                          
                          {/* Show actions only for Receiver if Pending */}
                          {!isMe && msg.offerStatus === 'pending' && (
                              <div className="flex gap-2 mt-2">
                                  <button onClick={() => handleRespond(msg._id, 'accepted')} className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 text-xs font-bold">
                                      <CheckCircle size={12} /> Accept
                                  </button>
                                  <button onClick={() => handleRespond(msg._id, 'rejected')} className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 text-xs font-bold">
                                      <XCircle size={12} /> Reject
                                  </button>
                              </div>
                          )}
                      </div>
                  ) : (
                      <p>{msg.content}</p>
                  )}
                  
                  <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type message or /offer [amount]"
          className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 transition"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default Chat;