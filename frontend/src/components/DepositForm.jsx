import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { getDepositQueueContract } from '../utils/contractHelpers';
import { depositAPI } from '../services/api';
import { calculateWeiFromTry } from '../utils/currency';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import WalletSelector from './WalletSelector';

const DepositForm = ({ propertyId, propertyPrice, onDepositSuccess }) => {
  const { signer, account } = useBlockchain();
  const [loading, setLoading] = useState(false);
  const [conversion, setConversion] = useState(null);
  const [showWalletSelector, setShowWalletSelector] = useState(false);

  useEffect(() => {
    const calc = async () => {
      if (propertyPrice) {
        const result = await calculateWeiFromTry(Number(propertyPrice));
        setConversion(result);
      }
    };
    calc();
  }, [propertyPrice]);

  const handleDeposit = async () => {
    setShowWalletSelector(false); // Close modal
    
    // Check signer again as it might have changed
    if (!signer) return toast.error("Please connect wallet first");
    if (!conversion) return toast.info("Calculating exchange rate...");
    
    setLoading(true);
    try {
      const contract = getDepositQueueContract(signer);
      if (!contract) throw new Error("Smart Contract not found.");
      
      let propertyIdBytes;
      if (propertyId.startsWith('0x')) {
        try {
           propertyIdBytes = ethers.zeroPadValue(propertyId, 32);
        } catch (e) {
           propertyIdBytes = ethers.id(propertyId);
        }
      } else {
        propertyIdBytes = ethers.id(propertyId);
      }
      
      const weiValue = ethers.parseEther(conversion.simulatedEthAmount.toFixed(18));

      const tx = await contract.submitDeposit(propertyIdBytes, {
        value: weiValue,
        gasLimit: 300000
      });
      
      toast.info("Transaction sent, waiting for confirmation...");
      await tx.wait();

      await depositAPI.submit({
        propertyId,
        depositorWallet: account,
        anonymousId: ethers.keccak256(ethers.toUtf8Bytes(account + Date.now())),
        amount: Number(propertyPrice),
        queuePosition: 0,
        blockchainTxHash: tx.hash
      });

      toast.success("Deposit Submitted Successfully!");
      if (onDepositSuccess) onDepositSuccess();

    } catch (error) {
      console.error("Deposit Error:", error);
      toast.error("Error: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-8 transition-colors duration-200">
      <div className="mb-6">
        <p className="text-gray-500 dark:text-gray-400 text-sm">Deposit Amount Required</p>
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{propertyPrice} ₺</p>
        
        {conversion ? (
          <div className="mt-3 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg text-xs">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600 dark:text-gray-300">Real Market Value:</span>
              <span className="font-mono font-bold text-gray-800 dark:text-gray-200">~{conversion.realEthAmount.toFixed(4)} ETH</span>
            </div>
            <div className="flex justify-between border-t border-blue-200 dark:border-blue-800 pt-1">
              <span className="text-blue-700 dark:text-blue-300 font-bold">Demo Charge (0.1%):</span>
              <span className="font-mono font-bold text-blue-700 dark:text-blue-300">~{conversion.simulatedEthAmount.toFixed(6)} ETH</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-2">Fetching exchange rates...</p>
        )}
      </div>
      
      {account ? (
        <button 
          onClick={() => setShowWalletSelector(true)}
          disabled={loading || !conversion}
          className={`w-full py-3 rounded-xl font-bold text-white transition shadow-lg shadow-blue-200 dark:shadow-none ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Processing...' : 'Submit Deposit'}
        </button>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200 p-4 rounded-lg text-sm border border-yellow-100 dark:border-yellow-800">
          Please connect your wallet to submit a deposit.
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-400 text-center">
        Transactions are secured by Smart Contracts.
      </div>

      {showWalletSelector && (
        <WalletSelector 
          amount={propertyPrice} 
          onSelect={handleDeposit} 
          onClose={() => setShowWalletSelector(false)} 
        />
      )}
    </div>
  );
};

export default DepositForm;
