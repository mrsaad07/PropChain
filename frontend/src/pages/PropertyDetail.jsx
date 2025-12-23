import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DepositForm from '../components/DepositForm';
import ContractSigner from '../components/ContractSigner';
import Chat from '../components/Chat';
import { propertyAPI, depositAPI } from '../services/api';
import { useBlockchain } from '../context/BlockchainContext';
import { MessageSquare } from 'lucide-react';

const PropertyDetail = () => {
  const { id } = useParams();
  const { account } = useBlockchain();
  const [property, setProperty] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSigner, setShowSigner] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [userDeposit, setUserDeposit] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const propRes = await propertyAPI.getById(id);
      setProperty(propRes.data.data);

      const queueRes = await depositAPI.getQueue(id);
      setQueue(queueRes.data.data);

      if (account) {
        const myDepositsRes = await depositAPI.getMyDeposits();
        const myActiveDep = myDepositsRes.data.data.find(
          d => d.propertyId === id && (d.status === 'pending' || d.status === 'accepted')
        );
        setUserDeposit(myActiveDep);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  }, [id, account]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-blue-600 dark:text-blue-400 font-bold text-xl animate-pulse">Loading Property Details...</div>
      </div>
    );
  }
  
  if (!property || !property.details || !property.address) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
          <div className="text-center text-red-500">
            <h2 className="text-2xl font-bold">Error</h2>
            <p>Could not load property data. It might be missing or invalid.</p>
          </div>
        </div>
    );
  }

  const isOwner = account && property.ownerWallet.toLowerCase() === account.toLowerCase();
  const acceptedDeposit = userDeposit && userDeposit.status === 'accepted' ? userDeposit : null;
  const myQueuePosition = userDeposit ? queue.findIndex(d => d.anonymousId === userDeposit.anonymousId) + 1 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{property.propertyType}</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{property.address.street}, {property.address.district}, {property.address.city}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-100 dark:border-gray-700">
                <div><p className="text-sm text-gray-500 dark:text-gray-400">Rooms</p><p className="font-semibold dark:text-white">{property.details.rooms}</p></div>
                <div><p className="text-sm text-gray-500 dark:text-gray-400">Size</p><p className="font-semibold dark:text-white">{property.details.squareMeters} m²</p></div>
                <div><p className="text-sm text-gray-500 dark:text-gray-400">Floor</p><p className="font-semibold dark:text-white">{property.details.floor || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500 dark:text-gray-400">Furnished</p><p className="font-semibold dark:text-white">{property.details.furnished ? 'Yes' : 'No'}</p></div>
              </div>
              <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                <h3 className="text-lg font-bold mb-2 text-purple-900 dark:text-purple-300">Tenant Preferences</h3>
                <p className="text-purple-800 dark:text-purple-200 italic">
                  {property.tenantRequirements || "The owner has not specified any requirements."}
                </p>
              </div>
            </div>

            {/* Deposit Queue List */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Deposit Queue ({queue.length})</h3>
              {queue.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No deposits yet. Be the first!</p>
              ) : (
                <div className="space-y-3">
                  {queue.map((item, idx) => {
                    const isMe = userDeposit && item.anonymousId === userDeposit.anonymousId;
                    return (
                      <div key={idx} className={`flex justify-between items-center p-3 rounded-lg border ${isMe ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-gray-50 border-gray-100 dark:bg-gray-700/50 dark:border-gray-600'}`}>
                        <div className="flex items-center gap-3">
                          <span className={`font-bold text-sm w-6 h-6 flex items-center justify-center rounded-full ${isMe ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300'}`}>
                            {idx + 1}
                          </span>
                          <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
                            {isMe ? 'YOU' : item.anonymousId ? `${item.anonymousId.substring(0, 10)}...` : 'Hidden'}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.amount} ₺</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {property.status === 'sold' ? (
               <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-8 rounded-xl shadow-sm text-center">
                 <h2 className="text-3xl font-extrabold text-red-600 dark:text-red-400 mb-2">SOLD OUT</h2>
                 <p className="text-red-800 dark:text-red-300">This property has been sold and is no longer available.</p>
               </div>
            ) : isOwner ? (
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-6 rounded-xl shadow-sm">
                <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2">You Own This Property</h3>
              </div>
            ) : userDeposit ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 p-6 rounded-xl shadow-sm">
                <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">Deposit Submitted</h3>
                <div className="flex justify-between items-center mb-4">
                   <span className="text-sm text-yellow-700 dark:text-yellow-300">Status: <strong>{userDeposit.status}</strong></span>
                   {myQueuePosition > 0 && <span className="bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 text-xs font-bold px-2 py-1 rounded-full">#{myQueuePosition} in Line</span>}
                </div>
                {acceptedDeposit && (
                  <button onClick={() => setShowSigner(true)} className={`w-full mt-4 py-3 text-white rounded-lg font-bold transition ${property.listingType === 'sale' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    {property.listingType === 'sale' ? 'Complete Purchase' : 'Sign Lease Contract'}
                  </button>
                )}
              </div>
            ) : (
              <DepositForm 
                propertyId={property.propertyId} 
                propertyPrice={property.price}
                onDepositSuccess={fetchData}
              />
            )}
             {!isOwner && account && property.status !== 'sold' && (
              <button onClick={() => setShowChat(!showChat)} className="w-full py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm">
                <MessageSquare size={20} className="text-blue-600" />
                {showChat ? 'Close Chat' : 'Chat with Owner'}
              </button>
            )}
          </div>
        </div>
      </div>
      {showSigner && <ContractSigner property={property} deposit={acceptedDeposit} onClose={() => setShowSigner(false)} />}
      {showChat && <Chat contactWallet={property.ownerWallet} onClose={() => setShowChat(false)} />}
    </div>
  );
};

export default PropertyDetail;
