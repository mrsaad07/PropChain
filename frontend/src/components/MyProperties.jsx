import React, { useEffect, useState } from 'react';
import { propertyAPI } from '../services/api';
import { Link } from 'react-router-dom';

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const res = await propertyAPI.getMyProperties();
        setProperties(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProps();
  }, []);

  if (loading) return <div>Loading properties...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Properties</h2>
      {properties.length === 0 ? (
        <p className="text-gray-500">You haven't listed any properties yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {properties.map(p => (
            <div key={p._id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800">{p.propertyType}</h3>
                <p className="text-sm text-gray-600">{p.address.city}, {p.address.district}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  p.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {p.status}
                </span>
              </div>
              <Link 
                to={`/property/${p.propertyId}`} 
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Manage / View
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProperties;
