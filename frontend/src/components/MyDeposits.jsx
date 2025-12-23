import React, { useEffect, useState } from 'react';
import { depositAPI } from '../services/api';
import { useBlockchain } from '../context/BlockchainContext';
import { toast } from 'react-toastify';

const MyDeposits = () => {
  const { signer, user } = useBlockchain();
  const [activeTab, setActiveTab] = useState('sent');
  const [sentDeposits, setSentDeposits] = useState([]);
  const [receivedDeposits, setReceivedDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sentRes, receivedRes] = await Promise.all([
        depositAPI.getMyDeposits(),
        depositAPI.getReceivedDeposits()
      ]);
      setSentDeposits(sentRes.data.data);
      setReceivedDeposits(receivedRes.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load deposits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdraw = async (deposit) => {
    if (!signer) return toast.error("Connect and set an active wallet first.");
    try {
      await depositAPI.updateStatus(deposit._id, 'withdrawn', '0xMockTxHash');
      toast.success("Deposit successfully withdrawn.");
      fetchData();
    } catch (error) {
      toast.error(error.message || "Failed to withdraw deposit.");
    }
  };

  const handleAccept = async (deposit) => {
      // In a real app, this would involve a blockchain transaction to move funds
      try {
          await depositAPI.updateStatus(deposit._id, 'accepted', '0xMockTxHash');
          toast.success("Deposit accepted. Waiting for contract signature.");
          fetchData();
      } catch (error) {
          toast.error("Failed to accept deposit.");
      }
  };

  if (loading) return <div className="text-gray-500 dark:text-gray-400">Loading deposits...</div>;

  const deposits = activeTab === 'sent' ? sentDeposits : receivedDeposits;
  const isOwner = user?.roles?.includes('owner');

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Deposit Management</h2>
        
        {isOwner && (
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button 
                    onClick={() => setActiveTab('sent')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'sent' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                >
                    Sent
                </button>
                <button 
                    onClick={() => setActiveTab('received')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'received' ? 'bg-white dark:bg-gray-600 shadow-sm text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                >
                    Received
                </button>
            </div>
        )}
      </div>

      {deposits.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No {activeTab} deposits found.</p>
      ) : (
        <div className="space-y-4">
          {deposits.map(d => (
            <div key={d._id} className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 p-4 rounded-lg flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 dark:text-gray-100">{d.amount} ₺</span>
                    {activeTab === 'received' && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Incoming</span>}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Status: <span className={`font-medium capitalize ${d.status === 'pending' ? 'text-blue-500' : 'text-green-500'}`}>{d.status}</span></p>
                <p className="text-xs text-gray-400 dark:text-gray-500">From: {d.anonymousId?.substring(0, 10)}...</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Date: {new Date(d.createdAt).toLocaleDateString()}</p>
              </div>
              
              {/* Actions for Sent Deposits */}
              {activeTab === 'sent' && d.status === 'pending' && (
                <button 
                  onClick={() => handleWithdraw(d)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium border border-red-200 dark:border-red-800/50 px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Withdraw
                </button>
              )}

              {/* Actions for Received Deposits (Owner) */}
              {activeTab === 'received' && d.status === 'pending' && (
                  <button 
                    onClick={() => handleAccept(d)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition shadow-sm"
                  >
                    Accept Offer
                  </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDeposits;