import React, { useState } from 'react';
import { paymentAPI } from '../services/api';
import { toast } from 'react-toastify';

const BuildingAdmin = () => {
  const [formData, setFormData] = useState({
    buildingId: '',
    month: new Date().toISOString().slice(0, 7)
  });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await paymentAPI.getBuildingReport(formData.buildingId, formData.month);
      setReport(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching report. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">Building Management Report</h2>
      
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-8">
        <input 
          type="text" 
          name="buildingId" 
          placeholder="Building Name/ID" 
          onChange={handleChange}
          required
          className="flex-1 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100"
        />
        <input 
          type="month" 
          name="month" 
          value={formData.month}
          onChange={handleChange}
          required
          className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-gray-800 dark:bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-900 dark:hover:bg-gray-500 transition"
        >
          {loading ? 'Searching...' : 'Generate Report'}
        </button>
      </form>

      {report && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Collections</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{report.count}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
              <p className="text-green-600 dark:text-green-400 text-sm">Total Amount</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{report.totalAmount} ₺</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <p className="text-blue-600 dark:text-blue-400 text-sm">Period</p>
              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{report.month}</p>
            </div>
          </div>

          <h3 className="font-bold text-lg mt-8 dark:text-gray-100">Payment Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                  <th className="pb-2">Apt No</th>
                  <th className="pb-2">Payer</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {report.payments.map(p => (
                  <tr key={p._id} className="text-sm">
                    <td className="py-3 font-bold dark:text-gray-200">{p.apartmentNo}</td>
                    <td className="py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{p.tenantWallet}</td>
                    <td className="py-3 dark:text-gray-300">{p.amount} ₺</td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingAdmin;
