import React, { useEffect, useState } from 'react';
import { extrasAPI } from '../services/api';
import { toast } from 'react-toastify';

const MyContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = async () => {
    try {
      const res = await extrasAPI.getMyContracts();
      setContracts(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleTerminate = async (contractId) => {
    if (!window.confirm("Are you sure you want to terminate this lease?")) return;
    
    try {
      await extrasAPI.updateContractStatus({ contractId, status: 'terminated' });
      toast.success("Lease terminated successfully");
      fetchContracts();
    } catch (error) {
      toast.error("Failed to terminate lease");
    }
  };

  if (loading) return <div>Loading contracts...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">My Digital Lease Agreements</h2>
      {contracts.length === 0 ? (
        <p className="text-gray-500">No contracts signed yet.</p>
      ) : (
        contracts.map(c => (
          <div key={c._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-blue-600 dark:text-blue-400">Lease Contract</h3>
                <p className="text-sm text-gray-500 font-mono">ID: {c.contractId.substring(0, 15)}...</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                c.status === 'signed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {c.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
              <div>
                <p className="font-semibold">Signed Date</p>
                <p>{new Date(c.signedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-semibold">Blockchain Proof</p>
                <button 
                  onClick={() => toast.info('In a real app, this would link to a block explorer!')}
                  className="text-blue-500 underline truncate block text-left"
                >
                  {c.blockchainTxHash.substring(0, 20)}...
                </button>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-xs font-mono break-all border border-gray-200 dark:border-gray-600 max-w-md">
                <span className="font-bold text-gray-700 dark:text-gray-300">PDF Hash:</span><br/>
                {c.pdfHash}
              </div>
              
              {c.status === 'signed' && (
                <button 
                  onClick={() => handleTerminate(c.contractId)}
                  className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold transition"
                >
                  Terminate Lease
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyContracts;