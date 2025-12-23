import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { getRentPaymentContract } from '../utils/contractHelpers';
import { paymentAPI } from '../services/api';
import { calculateWeiFromTry } from '../utils/currency';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const RentForm = ({ onPaymentSuccess, initialData }) => {
  const { signer, account } = useBlockchain();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: '',
    ownerWallet: '',
    month: new Date().toISOString().slice(0, 7),
    amount: ''
  });
  const [conversion, setConversion] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);
  
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

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!signer) return toast.error("Please connect and set an active wallet first");
    
    setLoading(true);
    try {
      const contract = getRentPaymentContract(signer);
      
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

      toast.success("Rent Paid Successfully!");
      if (onPaymentSuccess) onPaymentSuccess();

    } catch (error) {
      console.error(error);
      toast.error("Error processing rent payment: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Pay Monthly Rent</h3>
      <form onSubmit={handlePayment} className="space-y-4">
        {/* ... JSX for form inputs ... */}
         <button 
          type="submit" 
          disabled={loading || !conversion}
          className={`w-full py-2 rounded-lg font-bold text-white transition ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {loading ? 'Processing...' : 'Pay Rent'}
        </button>
      </form>
    </div>
  );
};

export default RentForm;
