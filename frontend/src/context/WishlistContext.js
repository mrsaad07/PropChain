import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
  }, []);

  const addToWishlist = (property) => {
    if (wishlist.find(item => item.propertyId === property.propertyId)) {
      toast.info("Already in wishlist");
      return;
    }
    const newWishlist = [...wishlist, property];
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    toast.success("Added to wishlist ❤️");
  };

  const removeFromWishlist = (propertyId) => {
    const newWishlist = wishlist.filter(item => item.propertyId !== propertyId);
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    toast.info("Removed from wishlist");
  };

  const isInWishlist = (propertyId) => {
    return wishlist.some(item => item.propertyId === propertyId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
