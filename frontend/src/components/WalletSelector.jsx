import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { Wallet as WalletIcon, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const WalletSelector = ({ amount, onSelect, onClose }) => {
  const { wallets, switchActiveWallet, activeWallet } = useBlockchain();
  const [selectedAddress, setSelectedAddress] = useState(activeWallet?.address);

  const handleConfirm = async () => {
    if (!selectedAddress) return toast.error("Please select a wallet.");
    
    // In a real app, we would check the balance here before proceeding.
    // For now, we switch the active wallet in context so the payment form uses the correct signer.
    if (selectedAddress !== activeWallet?.address) {
       await switchActiveWallet(selectedAddress);
    }
    onSelect();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <WalletIcon className="text-blue-600" /> Select Wallet
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Choose a wallet to pay <strong>{amount} ₺</strong> (approx. ETH).
        </p>

        <div className="space-y-3 max-h-60 overflow-y-auto mb-6">
          {wallets.map(wallet => (
            <div 
              key={wallet.address}
              onClick={() => setSelectedAddress(wallet.address)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex justify-between items-center ${
                selectedAddress === wallet.address 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <div>
                <div className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  {wallet.alias}
                  {wallet.walletType === 'demo' && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">Demo</span>}
                </div>
                <div className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-1">
                  {wallet.address.substring(0, 8)}...{wallet.address.substring(wallet.address.length - 6)}
                </div>
              </div>
              {selectedAddress === wallet.address && <CheckCircle className="text-blue-600" size={20} />}
            </div>
          ))}
        </div>

        <button 
          onClick={handleConfirm}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none"
        >
          Confirm & Pay
        </button>
      </div>
    </div>
  );
};

export default WalletSelector;
