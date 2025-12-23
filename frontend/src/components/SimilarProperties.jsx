import React, { useEffect, useState } from 'react';
import { propertyAPI } from '../services/api';
import PropertyCard from './PropertyCard';

const SimilarProperties = ({ propertyType, city, currentId }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        // Filter by city and type, excluding current
        const res = await propertyAPI.getAll({ city, propertyType, limit: 3 });
        const filtered = res.data.data.filter(p => p.propertyId !== currentId).slice(0, 3);
        setProperties(filtered);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (city) fetchSimilar();
  }, [city, propertyType, currentId]);

  if (!loading && properties.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">Similar Properties in {city}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => <PropertyCard key={i} isLoading={true} />)
        ) : (
          properties.map(p => <PropertyCard key={p._id} property={p} />)
        )}
      </div>
    </div>
  );
};

export default SimilarProperties;