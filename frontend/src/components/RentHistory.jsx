import React, { useEffect, useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { paymentAPI } from '../services/api';
import { downloadCSV } from '../utils/exporter';
import { Download } from 'lucide-react';

const RentHistory = ({ refreshTrigger }) => {
  const { account } = useBlockchain();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!account) return;
      setLoading(true);
      try {
        const res = await paymentAPI.getTenantHistory(account, { page, limit: 5 });
        setPayments(res.data.data);
        setTotalPages(res.data.pages);
      } catch (error) {
        console.error("Error fetching rent history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [account, refreshTrigger, page]);

  const handleExport = () => {
    // Ideally fetch ALL data for export, not just paginated. 
    // For MVP, exporting current view or we could call API without limit.
    const exportData = payments.map(p => ({
      Date: new Date(p.createdAt).toLocaleDateString(),
      Month: p.month,
      Amount: p.amount,
      Property: p.propertyId,
      Status: p.status,
      TxHash: p.blockchainTxHash
    }));
    downloadCSV(exportData, 'Rent_History.csv');
  };

  const handlePrev = () => setPage(p => Math.max(1, p - 1));
  const handleNext = () => setPage(p => Math.min(totalPages, p + 1));

  if (loading && page === 1) return <div className="text-center py-4 text-gray-500 text-sm">Loading rent history...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Rent Payment History</h3>
        <button 
          onClick={handleExport} 
          className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-xs font-medium border border-gray-200 px-3 py-1 rounded-lg"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>
      
      {payments.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Month</th>
                  <th className="pb-2 font-medium">Property ID</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => (
                  <tr key={p._id} className="text-sm hover:bg-gray-50">
                    <td className="py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 font-medium">{p.month}</td>
                    <td className="py-3 text-gray-600 truncate max-w-[100px]">{p.propertyId}</td>
                    <td className="py-3 font-bold text-gray-800">{p.amount} ₺</td>
                    <td className="py-3 text-gray-500 font-mono truncate max-w-[100px]">{p.ownerWallet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 text-sm">
              <button 
                onClick={handlePrev} 
                disabled={page === 1}
                className={`px-3 py-1 rounded border ${page === 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Prev
              </button>
              <span className="text-gray-500">Page {page} of {totalPages}</span>
              <button 
                onClick={handleNext} 
                disabled={page === totalPages}
                className={`px-3 py-1 rounded border ${page === totalPages ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500 text-sm py-4">No rent payments found.</p>
      )}
    </div>
  );
};

export default RentHistory;
