import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { useNotification } from '../context/NotificationContext';
import { getRentPaymentContract } from '../utils/contractHelpers';
import { paymentAPI, propertyAPI } from '../services/api';
import { calculateWeiFromTry } from '../utils/currency';
import { ethers } from 'ethers';
import WalletSelector from './WalletSelector';

const RentForm = ({ onPaymentSuccess, initialData }) => {
  const { signer, account } = useBlockchain();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(false);
  const [rentals, setRentals] = useState([]);
  const [selectedRental, setSelectedRental] = useState('');
  
  const [formData, setFormData] = useState({
    propertyId: '',
    ownerWallet: '',
    month: new Date().toISOString().slice(0, 7),
    amount: ''
  });
  const [conversion, setConversion] = useState(null);
  const [showWalletSelector, setShowWalletSelector] = useState(false);

  useEffect(() => {
    const fetchRentals = async () => {
        try {
            const { data } = await propertyAPI.getMyRentals();
            if (data.success) {
                setRentals(data.data);
            }
        } catch (e) {
            console.error("Failed to fetch rentals", e);
        }
    };
    fetchRentals();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleRentalSelect = (e) => {
      const propertyId = e.target.value;
      setSelectedRental(propertyId);
      if (!propertyId) return;

      const property = rentals.find(p => p.propertyId === propertyId);
      if (property) {
          setFormData(prev => ({
              ...prev,
              propertyId: property.propertyId,
              ownerWallet: property.ownerWallet,
              amount: property.price ? property.price.toString() : '' // Assuming price is monthly rent for rental properties
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
      const contract = getRentPaymentContract(signer);
      
      // Use keccak256 hash of the property ID string if it's not already bytes32
      // However, our system stores propertyId as a bytes32 hash string (0x...)
      // So we generally pass it directly, but ethers.id would double-hash it if it's a string.
      // Based on previous code: ethers.id(formData.propertyId) was used.
      // Verification: If propertyId is ALREADY a hash from DB (0x...), double hashing might be wrong
      // UNLESS the contract expects the hash of the ID.
      // Let's stick to existing pattern: ethers.id(formData.propertyId) implies the DB ID is a plaintext string?
      // No, DB says "0x...". 
      // Safe bet: If it starts with 0x, pass as is (if valid bytes32), else hash it.
      // Actually, previous code used ethers.id(formData.propertyId). I will preserve that behavior to avoid breaking contract logic
      // BUT if the propertyId IS the hash (0x...), ethers.id() will hash the "0x..." string, which is fine if consistent.
      
      const propertyIdBytes = ethers.id(formData.propertyId); 
      const weiValue = ethers.parseEther(conversion.simulatedEthAmount.toFixed(18));

      const tx = await contract.payRent(
        propertyIdBytes,
        formData.ownerWallet,
        formData.month,
        { value: weiValue, gasLimit: 300000 }
      );
      
      await tx.wait();

      await paymentAPI.payRent({
        propertyId: formData.propertyId,
        tenantWallet: account,
        ownerWallet: formData.ownerWallet,
        month: formData.month,
        amount: Number(formData.amount),
        status: 'paid',
        blockchainTxHash: tx.hash
      });

      notify("Rent Paid Successfully!", 'success');
      if (onPaymentSuccess) onPaymentSuccess();

    } catch (error) {
      console.error(error);
      notify("Error processing rent payment: " + (error.reason || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Pay Monthly Rent</h3>
      
      <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Rented Property</label>
          <select 
            value={selectedRental} 
            onChange={handleRentalSelect}
            className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm"
          >
              <option value="">-- Manual Input --</option>
              {rentals.map(p => (
                  <option key={p.propertyId} value={p.propertyId}>
                      {p.propertyType} - {p.address.district}/{p.address.city} ({p.price} TL)
                  </option>
              ))}
          </select>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setShowWalletSelector(true); }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property ID (Hash)</label>
          <input 
            type="text" 
            name="propertyId"
            value={formData.propertyId}
            onChange={handleChange} 
            placeholder="0x..."
            required 
            readOnly={!!selectedRental}
            className={`w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm ${selectedRental ? 'opacity-70 cursor-not-allowed' : ''}`} 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner Wallet Address</label>
          <input 
            type="text" 
            name="ownerWallet" 
            value={formData.ownerWallet}
            onChange={handleChange} 
            placeholder="0x..."
            required 
            readOnly={!!selectedRental}
            className={`w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm font-mono ${selectedRental ? 'opacity-70 cursor-not-allowed' : ''}`} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (TL)</label>
            <input 
              type="number" 
              name="amount" 
              value={formData.amount}
              onChange={handleChange} 
              required 
              readOnly={!!selectedRental}
              className={`w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm ${selectedRental ? 'opacity-70 cursor-not-allowed' : ''}`} 
            />
          </div>
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
          {loading ? 'Processing...' : 'Pay Rent'}
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

export default RentForm;