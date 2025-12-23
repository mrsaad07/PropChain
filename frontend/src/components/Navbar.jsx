import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBlockchain } from '../context/BlockchainContext';
import { useTheme } from '../context/ThemeContext';
import { Bell, MessageSquare, Sun, Moon, Menu, X } from 'lucide-react';
import { extrasAPI } from '../services/api';
import ChatList from './ChatList';
import Chat from './Chat';

const Navbar = () => {
  const { account, logout, user } = useBlockchain();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Chat States
  const [showChatList, setShowChatList] = useState(false);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    if (user) { 
      const fetchNotifications = async () => {
        if (!localStorage.getItem('token')) return;
        try {
          const res = await extrasAPI.getNotifications();
          if (res.data && res.data.data) {
            setNotifications(res.data.data);
            setUnreadCount(res.data.data.filter(n => !n.read).length);
          }
        } catch (error) {
           console.warn("Notification fetch failed");
        }
      };
      
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleOpenChat = (wallet) => {
    setActiveChat(wallet);
    setShowChatList(false);
    setShowNotifications(false);
  };

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-md px-6 py-4 z-50 relative transition-colors duration-200 border-b dark:border-slate-700">
      <div className="flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
          <span>PropChain</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/properties" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">Properties</Link>
          
          {user && (
            <>
              <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">Dashboard</Link>
              <Link to="/wallet" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">Wallet</Link>
              
              {/* Chat Icon */}
              <button 
                onClick={() => setShowChatList(!showChatList)}
                className="relative text-gray-500 dark:text-gray-400 hover:text-blue-600 transition"
              >
                <MessageSquare size={20} />
              </button>
              
              {/* Notification Icon */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-gray-500 dark:text-gray-400 hover:text-blue-600 transition focus:outline-none"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-700 rounded-xl shadow-xl border border-gray-100 dark:border-slate-600 overflow-hidden z-50">
                    <div className="p-3 border-b border-gray-100 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 flex justify-between items-center">
                      <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm">Notifications</h3>
                      <span className="text-xs text-blue-600 cursor-pointer">Mark all read</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(n => (
                          <div 
                            key={n._id} 
                            onClick={() => {
                                // Extract wallet if notification is about a message
                                if (n.title === 'New Message') {
                                    // A simple parsing, ideally backend sends senderWallet in metadata
                                    // Assuming message format: "from 0x123..."
                                    // For now, we rely on the user checking the ChatList for accuracy
                                    setShowChatList(true);
                                    setShowNotifications(false);
                                }
                            }}
                            className={`p-3 border-b border-gray-50 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition cursor-pointer ${!n.read ? 'bg-blue-50 dark:bg-slate-700' : ''}`}
                          >
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{n.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-2 text-right">{new Date(n.createdAt).toLocaleTimeString()}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-400 dark:text-gray-500 text-sm">
                          No notifications yet.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-yellow-400 transition p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              {account ? (
                 <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 px-4 py-1 rounded-full border border-blue-100 dark:border-blue-800 text-sm font-medium">
                  {account.substring(0, 6)}...{account.substring(account.length - 4)}
                </div>
              ) : (
                <Link to="/wallet" className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                  Setup Wallet
                </Link>
              )}
             
              <button 
                onClick={logout}
                className="text-xs text-red-500 hover:text-red-700 hover:underline px-2"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-md shadow-blue-200 dark:shadow-none"
            >
              Login / Connect
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
           <button onClick={toggleTheme} className="text-gray-500 dark:text-gray-400">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600 dark:text-gray-300">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Render Chat List Modal */}
      {showChatList && <ChatList onSelectChat={handleOpenChat} onClose={() => setShowChatList(false)} />}
      
      {/* Render Active Chat Window */}
      {activeChat && <Chat contactWallet={activeChat} onClose={() => setActiveChat(null)} />}

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-gray-100 dark:border-slate-700 flex flex-col gap-4 pt-4">
          <Link to="/properties" className="text-gray-600 dark:text-gray-300 py-2 px-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg">Properties</Link>
          {user && (
            <>
              <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 py-2 px-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg">Dashboard</Link>
              <Link to="/wallet" className="text-gray-600 dark:text-gray-300 py-2 px-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg">Wallet</Link>
              <button onClick={() => setShowChatList(true)} className="text-left text-gray-600 dark:text-gray-300 py-2 px-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg">Messages</button>
              {!account && (
                 <Link to="/wallet" className="text-green-600 font-bold py-2 px-2 hover:bg-green-50 rounded-lg">Setup Wallet &rarr;</Link>
              )}
              <button onClick={logout} className="text-left text-red-500 py-2 px-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg">Logout</button>
            </>
          )}
          {!user && (
             <Link to="/login" className="bg-blue-600 text-white w-full text-center py-3 rounded-lg font-bold shadow-lg">Login / Connect</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
