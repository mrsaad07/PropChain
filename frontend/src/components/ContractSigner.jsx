/* global BigInt */
import React, { useState } from 'react';
import { sha256 } from '../utils/crypto';
import { useBlockchain } from '../context/BlockchainContext';
import { useNotification } from '../context/NotificationContext';
import { extrasAPI, propertyAPI } from '../services/api';
import { getPropertyRegistryContract } from '../utils/contractHelpers';
import { ethers } from 'ethers';

const ContractSigner = ({ property, deposit, onClose }) => {
  const { account, signer } = useBlockchain();
  const { notify } = useNotification();
  const [signing, setSigning] = useState(false);

  const isSale = property.listingType === 'sale';

  const generatePDFContent = () => {
    const today = new Date().toLocaleDateString();
    
    if (isSale) {
        return `
      REAL ESTATE PURCHASE AGREEMENT
      
      Date: ${today}
      
      SELLER: ${property.ownerWallet}
      BUYER: ${account}
      
      PROPERTY:
      ${property.address.street} No:${property.address.buildingNo}/${property.address.apartmentNo}
      ${property.address.district}, ${property.address.city}
      
      TERMS:
      Purchase Price: ${property.price} TL
      Deposit Paid: ${deposit.amount} TL
      
      The Seller agrees to transfer the ownership of the property to the Buyer upon receipt of the full purchase price.
      The Buyer agrees to pay the remaining balance and accept the property "as is".
      
      Signed Digitally via PropChain.
        `;
    }

    return `
      RESIDENTIAL LEASE AGREEMENT
      
      Date: ${today}
      
      LANDLORD: ${property.ownerWallet}
      TENANT: ${account}
      
      PROPERTY:
      ${property.address.street} No:${property.address.buildingNo}/${property.address.apartmentNo}
      ${property.address.district}, ${property.address.city}
      
      TERMS:
      Monthly Rent: ${property.price} TL
      Security Deposit: ${deposit.amount} TL
      
      The Tenant agrees to pay the rent on the 1st of every month using the PropChain Smart Contract System.
      
      Signed Digitally via PropChain.
    `;
  };

  const handleSign = async () => {
    setSigning(true);
    try {
      const content = generatePDFContent();
      const pdfHash = await sha256(content);
      
      let tx;

      if (isSale) {
          // Buying the property
          const registryContract = getPropertyRegistryContract(signer);
          if (!registryContract) throw new Error("Blockchain connection failed");

          // For Demo: Use Wei = Price (which is small) or a fixed small amount to ensure it works
          // Real world: Oracle price feed or stablecoin
          const priceInWei = BigInt(property.price); // Assuming price is small enough or just for demo logic
          
          // Call buyProperty on smart contract
          console.log("Buying Property:", property.propertyId, "Price:", priceInWei.toString());
          tx = await registryContract.buyProperty(property.propertyId, { 
              value: priceInWei,
              gasLimit: 500000 // Manually set gas limit
          });
      } else {
          // Signing Lease (Just recording hash for now, or calling startLease if it existed)
          tx = await signer.sendTransaction({
            to: property.ownerWallet,
            value: 0,
            data: pdfHash
          });
      }
      
      await tx.wait();

      // If Sale, update backend to mark as SOLD and Transfer Ownership
      if (isSale) {
          await propertyAPI.transferOwnership(property.propertyId, {
              newOwnerWallet: account,
              status: 'sold',
              txHash: tx.hash
          });
      }

      const contractId = ethers.id(content + Date.now());
      const contractData = {
        contractId,
        propertyId: property.propertyId,
        ownerWallet: property.ownerWallet,
        pdfHash,
        blockchainTxHash: tx.hash,
        contentData: content,
        type: isSale ? 'sale' : 'rent',
        price: property.price
      };
      
      await extrasAPI.saveContract(contractData);

      notify(isSale ? "Property Purchased Successfully!" : "Lease Contract Signed!", 'success');
      
      // Delay closing slightly to allow toast to be seen or state to update
      setTimeout(() => {
          window.location.reload(); // Hard refresh to ensure property status is reflected immediately
      }, 1500);
      
    } catch (error) {
      console.error("Transaction Error: ", error);
      // Handle the case where seeded properties aren't on chain
      if (error.message.includes("Property does not exist")) {
          notify("Error: This property is not registered on the blockchain (Seed Data). Please create a new property to test Purchase.", 'error');
      } else {
          notify("Transaction failed: " + (error.reason || error.message), 'error');
      }
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {isSale ? 'Sign Sales Agreement' : 'Sign Lease Agreement'}
        </h2>
        
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-xs font-mono mb-6 h-64 overflow-y-auto whitespace-pre-wrap border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
          {generatePDFContent()}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          By clicking "{isSale ? 'Purchase & Sign' : 'Sign & Record'}", {isSale ? 'the purchase amount will be transferred and' : ''} a digital hash of this contract will be permanently stored on the Blockchain.
        </p>

        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button 
            onClick={handleSign}
            disabled={signing}
            className={`flex-1 py-3 rounded-lg text-white font-bold disabled:opacity-50 ${isSale ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {signing ? 'Processing...' : (isSale ? 'Pay & Sign' : 'Sign & Record')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractSigner;
