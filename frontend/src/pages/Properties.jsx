import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import PropertyCard from '../components/PropertyCard';
import PropertyMap from '../components/PropertyMap';
import { propertyAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Search, Map as MapIcon, List } from 'lucide-react';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  
  // Filters
  const [filters, setFilters] = useState({
    city: '',
    propertyType: '',
    listingType: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 9, ...filters };
        Object.keys(params).forEach(key => params[key] === '' && delete params[key]);
        
        const res = await propertyAPI.getAll(params);
        setProperties(res.data.data);
        setTotalPages(res.data.pages);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [page, filters]); 

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new filter
    // The useEffect will automatically re-fetch
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
              <div className="flex items-center gap-2 mb-6 text-gray-800 dark:text-gray-100">
                <Filter size={20} />
                <h2 className="font-bold text-lg">Filters</h2>
              </div>
              
              <form onSubmit={handleFilterSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <input 
                    type="text" 
                    name="city" 
                    placeholder="Istanbul, Ankara..." 
                    value={filters.city}
                    onChange={handleFilterChange}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select 
                    name="propertyType" 
                    value={filters.propertyType}
                    onChange={handleFilterChange}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Villa">Villa</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Listing</label>
                  <select 
                    name="listingType" 
                    value={filters.listingType}
                    onChange={handleFilterChange}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="">Any</option>
                    <option value="rent">Rent</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Min Price</label>
                    <input 
                      type="number" 
                      name="minPrice" 
                      placeholder="0" 
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm px-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Max Price</label>
                    <input 
                      type="number" 
                      name="maxPrice" 
                      placeholder="Max" 
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm px-2"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Search size={16} /> Apply Filters
                </button>
              </form>
            </div>
          </div>

          {/* Property Grid/Map */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Properties</h1>
              <div className="flex gap-3">
                <button 
                  onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                  className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium text-sm flex items-center gap-2"
                >
                  {viewMode === 'list' ? <><MapIcon size={16}/> Show Map</> : <><List size={16}/> Show List</>}
                </button>
                <Link 
                  to="/properties/create"
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg hover:opacity-90 transition font-medium text-sm"
                >
                  + List Property
                </Link>
              </div>
            </div>

            {viewMode === 'map' ? (
              <PropertyMap properties={properties} filters={filters} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  [...Array(6)].map((_, i) => <PropertyCard key={i} isLoading={true} />)
                ) : properties.length > 0 ? (
                  properties.map((p, i) => (
                    <motion.div
                      key={p._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                    >
                      <PropertyCard property={p} />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="text-4xl mb-4">🏠</div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">No properties found</h3>
                    <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters.</p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {viewMode === 'list' && totalPages > 1 && !loading && (
              <div className="flex justify-center mt-10 gap-4">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="flex items-center text-gray-600 dark:text-gray-400 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Properties;