import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { useNotification } from '../context/NotificationContext';
import { getMaintenanceFeeContract } from '../utils/contractHelpers';
import { paymentAPI, propertyAPI } from '../services/api';
import { calculateWeiFromTry } from '../utils/currency';
import { ethers } from 'ethers';
import WalletSelector from './WalletSelector';

const MaintenanceForm = ({ onPaymentSuccess, initialData }) => {
  const { signer, account } = useBlockchain();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  
  const [formData, setFormData] = useState({
    buildingId: '',
    apartmentNo: '',
    month: new Date().toISOString().slice(0, 7),
    amount: ''
  });
  const [conversion, setConversion] = useState(null);
  const [showWalletSelector, setShowWalletSelector] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);
  
  // Fetch properties related to user (both owned and rented)
  useEffect(() => {
    const fetchData = async () => {
        try {
            const [rentalsRes, ownedRes] = await Promise.all([
                propertyAPI.getMyRentals(),
                propertyAPI.getMyProperties()
            ]);
            
            let allProps = [];
            if (rentalsRes.data.success) allProps = [...allProps, ...rentalsRes.data.data];
            if (ownedRes.data.success) allProps = [...allProps, ...ownedRes.data.data];
            
            // Deduplicate by propertyId
            const uniqueProps = Array.from(new Map(allProps.map(item => [item.propertyId, item])).values());
            setProperties(uniqueProps);
        } catch (e) {
            console.error("Failed to fetch user properties for maintenance", e);
        }
    };
    fetchData();
  }, []);

  const handlePropertySelect = (e) => {
    const pid = e.target.value;
    setSelectedProperty(pid);
    if (!pid) return;

    const prop = properties.find(p => p.propertyId === pid);
    if (prop) {
        setFormData(prev => ({
            ...prev,
            buildingId: prop.propertyId, // Using PropertyID as BuildingID for simplicity in this model
            apartmentNo: prop.address.apartmentNo || "1",
            amount: prop.maintenanceFee ? prop.maintenanceFee.toString() : ''
        }));
    }
  };

  useEffect(() => {
    const calc = async () => {
      if (formData.amount) {
        const result = await calculateWeiFromTry(Number(formData.amount));
        setConversion(result);
      } else {
        setConversion(null);
      }
    };
    const timer = setTimeout(calc, 500);
    return () => clearTimeout(timer);
  }, [formData.amount]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    setShowWalletSelector(false);
    if (!signer) return notify("Please connect and set an active wallet first", 'error');
    
    setLoading(true);
    try {
      const contract = getMaintenanceFeeContract(signer);
      
      const buildingIdBytes = ethers.id(formData.buildingId);
      const weiValue = ethers.parseEther(conversion.simulatedEthAmount.toFixed(18));

      const tx = await contract.payFee(
        buildingIdBytes,
        formData.apartmentNo,
        formData.month,
        { value: weiValue, gasLimit: 300000 }
      );
      
      await tx.wait();

      await paymentAPI.payMaintenance({
        buildingId: formData.buildingId,
        apartmentNo: formData.apartmentNo,
        tenantWallet: account,
        month: formData.month,
        amount: Number(formData.amount),
        status: 'paid',
        blockchainTxHash: tx.hash
      });

      notify("Maintenance Fee Paid Successfully!", 'success');
      if (onPaymentSuccess) onPaymentSuccess();

    } catch (error) {
      console.error(error);
      notify("Error processing fee payment: " + (error.reason || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Pay Maintenance Fee (Aidat)</h3>
      
      <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Property</label>
          <select 
            value={selectedProperty} 
            onChange={handlePropertySelect}
            className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm"
          >
              <option value="">-- Manual Input --</option>
              {properties.map(p => (
                  <option key={p.propertyId} value={p.propertyId}>
                      {p.propertyType} - {p.address.district} ({p.maintenanceFee} TL)
                  </option>
              ))}
          </select>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setShowWalletSelector(true); }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Building/Property ID</label>
          <input 
            type="text" 
            name="buildingId"
            value={formData.buildingId}
            onChange={handleChange} 
            placeholder="0x..."
            required 
            readOnly={!!selectedProperty}
            className={`w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm ${selectedProperty ? 'opacity-70 cursor-not-allowed' : ''}`} 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apartment No</label>
              <input 
                type="text" 
                name="apartmentNo" 
                value={formData.apartmentNo}
                onChange={handleChange} 
                required 
                readOnly={!!selectedProperty}
                className={`w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm ${selectedProperty ? 'opacity-70 cursor-not-allowed' : ''}`} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (TL)</label>
              <input 
                type="number" 
                name="amount" 
                value={formData.amount}
                onChange={handleChange} 
                required 
                readOnly={!!selectedProperty}
                className={`w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm ${selectedProperty ? 'opacity-70 cursor-not-allowed' : ''}`} 
              />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
            <input 
              type="month" 
              name="month" 
              value={formData.month}
              onChange={handleChange} 
              required 
              className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm" 
            />
          </div>

        {conversion && (
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-xs text-gray-500 dark:text-gray-400 flex justify-between">
            <span>Demo Charge:</span>
            <span className="font-mono font-bold text-gray-700 dark:text-gray-200">~{conversion.simulatedEthAmount.toFixed(6)} ETH</span>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || !conversion}
          className={`w-full py-2 rounded-lg font-bold text-white transition ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {loading ? 'Processing...' : 'Pay Aidat'}
        </button>
      </form>

      {showWalletSelector && (
        <WalletSelector 
          amount={formData.amount} 
          onSelect={handlePayment} 
          onClose={() => setShowWalletSelector(false)} 
        />
      )}
    </div>
  );
};

export default MaintenanceForm;