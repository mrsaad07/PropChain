import React, { useState, useEffect } from 'react';
import { extrasAPI } from '../services/api';
import { useBlockchain } from '../context/BlockchainContext';
import { User, MessageSquare } from 'lucide-react';

const ChatList = ({ onSelectChat, onClose }) => {
  const { account } = useBlockchain();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        // We fetch all messages and group them by contact to simulate an inbox
        // In a real production app, the backend would provide a specific /inbox endpoint
        const res = await extrasAPI.getMessages(); 
        if (res.data.success) {
          const msgs = res.data.data;
          const contacts = new Set();
          const inbox = [];

          // Group messages by the *other* person's wallet
          msgs.forEach(msg => {
            const other = msg.sender.toLowerCase() === account.toLowerCase() ? msg.receiver : msg.sender;
            if (!contacts.has(other)) {
              contacts.add(other);
              inbox.push({
                wallet: other,
                lastMessage: msg.content,
                date: msg.createdAt,
                unread: !msg.read && msg.receiver.toLowerCase() === account.toLowerCase()
              });
            }
          });
          
          setConversations(inbox);
        }
      } catch (error) {
        console.error("Failed to load inbox", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [account]);

  return (
    <div className="fixed top-16 right-4 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
      <div className="bg-blue-600 dark:bg-blue-800 p-4 text-white flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2">
          <MessageSquare size={18} /> Messages
        </h3>
        <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded">✕</button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No conversations yet.</div>
        ) : (
          conversations.map((conv, idx) => (
            <div 
              key={idx} 
              onClick={() => onSelectChat(conv.wallet)}
              className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition flex items-center gap-3"
            >
              <div className="bg-gray-200 dark:bg-gray-600 p-2 rounded-full">
                <User size={20} className="text-gray-600 dark:text-gray-300" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-gray-800 dark:text-gray-200 font-mono">
                    {conv.wallet.substring(0, 6)}...
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(conv.date).toLocaleDateString()}
                  </span>
                </div>
                <p className={`text-xs truncate ${conv.unread ? 'font-bold text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  {conv.lastMessage}
                </p>
              </div>
              {conv.unread && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
