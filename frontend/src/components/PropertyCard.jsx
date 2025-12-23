import React from 'react';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const PropertyCard = ({ property, isLoading }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <Skeleton height={192} baseColor="#e5e7eb" highlightColor="#f3f4f6" className="dark:bg-gray-700 dark:highlight-gray-600" />
        <div className="p-4">
          <Skeleton count={2} />
          <Skeleton width="60%" className="mt-4" />
        </div>
      </div>
    );
  }

  const isLiked = isInWishlist(property.propertyId);

  const toggleLike = (e) => {
    e.preventDefault();
    if (isLiked) {
      removeFromWishlist(property.propertyId);
    } else {
      addToWishlist(property);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition group relative">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800">
          <span className="text-4xl">🏠</span>
        </div>
        
        <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
            property.listingType === 'rent' ? 'bg-indigo-600 text-white' : 'bg-purple-600 text-white'
        }`}>
          {property.listingType}
        </span>

        <button 
          onClick={toggleLike}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white dark:bg-black/50 dark:hover:bg-black/70 transition shadow-sm"
        >
          <Heart size={18} className={isLiked ? "fill-red-500 text-red-500" : "text-gray-600 dark:text-gray-200"} />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 group-hover:text-blue-600 transition">{property.propertyType}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${
            property.status === 'available' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {property.status}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-1">{property.address.city}, {property.address.district}</p>
        
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">Price</span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{property.price.toLocaleString()} ₺</span>
          </div>
          {property.status === 'sold' ? (
             <button disabled className="bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
               Sold Out
             </button>
          ) : (
            <Link 
              to={`/property/${property.propertyId}`}
              className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            >
              Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;