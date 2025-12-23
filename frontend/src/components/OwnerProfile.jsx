import React, { useEffect, useState } from 'react';
import { propertyAPI } from '../services/api';
import PropertyCard from './PropertyCard';
import { X } from 'lucide-react';

const OwnerProfile = ({ ownerWallet, onClose }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwnerProperties = async () => {
      try {
        // In real app, we'd have a specific endpoint filter by ownerWallet
        // For MVP, we fetch all and filter client-side or use a new endpoint
        // Let's assume getAll supports ownerWallet filter or we filter client side
        const res = await propertyAPI.getAll({ limit: 100 }); 
        const filtered = res.data.data.filter(p => p.ownerWallet.toLowerCase() === ownerWallet.toLowerCase());
        setProperties(filtered);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOwnerProperties();
  }, [ownerWallet]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Owner Profile</h2>
            <p className="text-sm text-gray-500 font-mono">{ownerWallet}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
            <X size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Listings by this owner ({properties.length})</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <p>Loading listings...</p>
            ) : properties.length > 0 ? (
              properties.map(p => <PropertyCard key={p._id} property={p} />)
            ) : (
              <p className="text-gray-500">No active listings found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerProfile;
