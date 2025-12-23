import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useBlockchain } from '../context/BlockchainContext';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Copy, Eye, EyeOff, CheckCircle, PlusCircle, Edit, Save, Wallet as WalletIcon, Trash2 } from 'lucide-react';

const Wallet = () => {
  const { user, wallets, activeWallet, balance, addWallet, switchActiveWallet, removeWallet, refreshUser, loading } = useBlockchain();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAlias, setEditingAlias] = useState(null);
  const [newAlias, setNewAlias] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, walletAddress: '', input: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleConnectMetaMask = async () => {
    if (!window.ethereum) {
      return toast.error("MetaMask is not installed.");
    }
    setIsAdding(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const success = await addWallet({
        walletType: 'metamask',
        address: accounts[0],
      });
      if (success) {
        toast.success("MetaMask wallet added successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to connect MetaMask wallet.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddDemo = async () => {
    setIsAdding(true);
    try {
      await addWallet({ walletType: 'demo' });
      toast.success("New demo wallet added!");
    } catch (error) {
      toast.error("Failed to add new demo wallet.");
    } finally {
      setIsAdding(false);
    }
  };

  const openDeleteModal = (address) => {
    setDeleteModal({ show: true, walletAddress: address, input: '' });
  };

  const confirmDelete = async () => {
    const { walletAddress, input } = deleteModal;
    const last4 = walletAddress.slice(-4);
    
    if (input.toLowerCase() !== last4.toLowerCase()) {
      return toast.error(`Incorrect. Please type "${last4}" to confirm.`);
    }

    try {
      await removeWallet(walletAddress);
      toast.success("Wallet removed successfully.");
      setDeleteModal({ show: false, walletAddress: '', input: '' });
    } catch (error) {
      toast.error("Failed to remove wallet.");
    }
  };

  const handleEditAlias = (wallet) => {
    setEditingAlias(wallet.address);
    setNewAlias(wallet.alias);
  };

  const handleSaveAlias = async (address) => {
    if (!newAlias.trim()) return toast.warn("Alias cannot be empty.");
    try {
      await authAPI.updateWalletAlias(address, newAlias);
      await refreshUser();
      toast.success("Wallet alias updated!");
      setEditingAlias(null);
    } catch (error) {
      toast.error("Failed to update alias.");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.info("Copied to clipboard!");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-blue-600 dark:text-blue-400 font-bold animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">My Wallets</h1>
            <div className="flex gap-2">
                <button onClick={handleAddDemo} disabled={isAdding} className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-blue-200 dark:hover:bg-blue-900">
                    <PlusCircle size={16} /> Add Demo
                </button>
                 <button onClick={handleConnectMetaMask} disabled={isAdding} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-orange-600">
                    🦊 Connect MetaMask
                </button>
            </div>
        </div>

        {(!wallets || wallets.length === 0) ? (
            <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-xl shadow-md">
                <WalletIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No Wallets Found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding a demo wallet or connecting with MetaMask.</p>
            </div>
        ) : (
            <div className="space-y-6">
            {wallets.map(wallet => (
              <div key={wallet.address} className={`p-6 rounded-2xl border-2 transition ${activeWallet?.address === wallet.address ? 'bg-white dark:bg-gray-800 border-blue-500 shadow-lg' : 'bg-gray-100 dark:bg-gray-800/50 border-transparent'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{wallet.walletType === 'demo' ? '🚀' : '🦊'}</span>
                        {editingAlias === wallet.address ? (
                          <input type="text" value={newAlias} onChange={(e) => setNewAlias(e.target.value)} className="text-xl font-bold bg-transparent border-b-2 border-blue-500 outline-none text-gray-800 dark:text-gray-100" autoFocus />
                        ) : (
                          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{wallet.alias}</h2>
                        )}
                        {editingAlias === wallet.address ? (
                          <button onClick={() => handleSaveAlias(wallet.address)} className="text-green-500 hover:text-green-700"><Save size={18}/></button>
                        ) : (
                          <button onClick={() => handleEditAlias(wallet)} className="text-gray-400 hover:text-blue-500"><Edit size={16}/></button>
                        )}
                        <button onClick={() => openDeleteModal(wallet.address)} className="text-red-400 hover:text-red-600 ml-2" title="Delete Wallet"><Trash2 size={18}/></button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-mono text-gray-500 dark:text-gray-400">{wallet.address}</p>
                        <button onClick={() => copyToClipboard(wallet.address)} className="text-gray-400 hover:text-blue-500"><Copy size={14}/></button>
                    </div>
                  </div>
                  {activeWallet?.address === wallet.address ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-full text-sm font-medium">
                          <CheckCircle size={16}/> Active
                      </div>
                  ) : (
                      <button onClick={() => switchActiveWallet(wallet.address)} className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                          Set Active
                      </button>
                  )}
                </div>
                {activeWallet?.address === wallet.address && (
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-end">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
                            <p className={`text-3xl font-bold text-gray-900 dark:text-gray-50 ${!balanceVisible && 'blur-md select-none'}`}>
                                {parseFloat(balance).toFixed(4)} ETH
                            </p>
                        </div>
                        <button onClick={() => setBalanceVisible(!balanceVisible)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                             {balanceVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                )}
              </div>
            ))}
            </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Wallet?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                To confirm deletion, please type the last 4 characters of the wallet address: <strong className="text-mono">{deleteModal.walletAddress.slice(-4)}</strong>
              </p>
              <input 
                type="text" 
                value={deleteModal.input}
                onChange={(e) => setDeleteModal({...deleteModal, input: e.target.value})}
                placeholder={`Type "${deleteModal.walletAddress.slice(-4)}"`}
                className="w-full p-2 border rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => setDeleteModal({ show: false, walletAddress: '', input: '' })}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                  disabled={deleteModal.input.toLowerCase() !== deleteModal.walletAddress.slice(-4).toLowerCase()}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Wallet;
