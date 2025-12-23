import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useBlockchain } from '../context/BlockchainContext';
import { useNotification } from '../context/NotificationContext';
import { getPropertyRegistryContract } from '../utils/contractHelpers';
import { propertyAPI } from '../services/api';

const CreateProperty = () => {
  const { signer, account } = useBlockchain();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    propertyType: 'Apartment',
    city: '',
    district: '',
    street: '',
    buildingNo: '',
    apartmentNo: '',
    price: '',
    maintenanceFee: '',
    rooms: '',
    squareMeters: '',
    listingType: 'rent',
    tenantRequirements: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signer) {
      return notify("Please connect and set an active wallet first.", 'error');
    }
    
    setLoading(true);
    let tx;
    try {
      const contract = getPropertyRegistryContract(signer);
      if (!contract) {
        throw new Error("Smart Contract not found. Please ensure you are on the correct network.");
      }

      const locationString = `${formData.street}, ${formData.district}, ${formData.city}`;
      
      notify("Registering property on the blockchain...", 'info');
      tx = await contract.registerProperty(
        formData.propertyType,
        locationString,
        formData.price, // Prices are now expected as simple numbers
        formData.maintenanceFee
      );
      
      const receipt = await tx.wait();
      notify("Blockchain transaction successful! Syncing with server...", 'info');

      // Extract the real property ID from the event log
      let realPropertyId = null;
      for (const log of receipt.logs) {
        try {
            const parsedLog = contract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === 'PropertyRegistered') {
                realPropertyId = parsedLog.args[0];
                break;
            }
        } catch (e) {
            // Ignore logs that don't match this interface
        }
      }

      if (!realPropertyId) {
        throw new Error("Failed to retrieve property ID from blockchain event.");
      }

      // Now call backend API with the correct data
      await propertyAPI.create({
        propertyId: realPropertyId, // Use the ID from the event
        ownerWallet: account,
        propertyType: formData.propertyType,
        address: {
          city: formData.city,
          district: formData.district,
          street: formData.street,
          buildingNo: formData.buildingNo,
          apartmentNo: formData.apartmentNo
        },
        details: {
          rooms: Number(formData.rooms),
          squareMeters: Number(formData.squareMeters),
        },
        listingType: formData.listingType,
        price: Number(formData.price),
        maintenanceFee: Number(formData.maintenanceFee),
        tenantRequirements: formData.tenantRequirements,
        blockchainTxHash: tx.hash
      });

      notify("Property Registered Successfully!", 'success');
      navigate('/my-properties'); // Redirect to their properties page

    } catch (error) {
      console.error("Registration Error:", error);
      const apiErrorMessage = error.response?.data?.message;
      const blockchainErrorMessage = error.reason;
      notify(`Error creating property: ${apiErrorMessage || blockchainErrorMessage || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">Register Property</h1>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg">
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Listing For</label>
              <select name="listingType" value={formData.listingType} onChange={handleChange} className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg">
                <option value="rent">Rent</option>
                <option value="sale">Sale</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
              <input type="text" name="district" value={formData.district} onChange={handleChange} required className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" />
            </div>
          </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street</label>
              <input type="text" name="street" value={formData.street} onChange={handleChange} required className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" />
            </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (TL)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maintenance Fee (TL)</label>
              <input type="number" name="maintenanceFee" value={formData.maintenanceFee} onChange={handleChange} required className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rooms</label>
              <input type="number" name="rooms" value={formData.rooms} onChange={handleChange} required className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Size (m²)</label>
              <input type="number" name="squareMeters" value={formData.squareMeters} onChange={handleChange} required className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tenant Preferences (Optional)</label>
             <textarea 
               name="tenantRequirements" 
               rows="3"
               placeholder="e.g., Non-smoker, no pets..."
               value={formData.tenantRequirements}
               onChange={handleChange} 
               className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg"
             ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-white transition ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Processing Transaction...' : 'Register Property'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProperty;
