import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import { authAPI, setAuthToken } from '../services/api';

const BlockchainContext = createContext();

export const BlockchainProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState([]);
  const [activeWallet, setActiveWallet] = useState(null);
  const [signer, setSigner] = useState(null);
  const [balance, setBalance] = useState('0');

  // 1. Define logout first as it's a dependency for refreshUser
  const logout = useCallback(() => {
    setAuthToken(null);
    localStorage.removeItem('token');
    setUser(null);
    setWallets([]);
    setActiveWallet(null);
    setSigner(null);
    setBalance('0');
  }, []);

  const _updateSignerAndBalance = async (wallet) => {
    if (!wallet) return;
    try {
      let newSigner;
      
      if (wallet.walletType === 'metamask') {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        newSigner = await browserProvider.getSigner(wallet.address);
        // Only use browserProvider (MetaMask) to fetch balance if it IS a metamask wallet
        const bal = await browserProvider.getBalance(wallet.address);
        setBalance(ethers.formatEther(bal));
      } else {
        const jsonRpcProvider = new ethers.JsonRpcProvider(window.location.origin + "/ganache");
        newSigner = new ethers.Wallet(wallet.privateKey, jsonRpcProvider);
        // Use the local provider to fetch balance for demo/local wallets
        const bal = await jsonRpcProvider.getBalance(wallet.address);
        setBalance(ethers.formatEther(bal));
      }
      setSigner(newSigner);
    } catch (e) {
      console.error("Failed to update signer and balance:", e);
    }
  };

  // 2. Define _updateUserState as it's a dependency for refreshUser
  const _updateUserState = useCallback(async (userData) => {
    setUser(userData);
    setWallets(userData.wallets || []);
    if (userData.activeWallet) {
      const active = userData.wallets.find(w => w.address === userData.activeWallet);
      if (active) {
        setActiveWallet(active);
        await _updateSignerAndBalance(active);
      }
    } else {
      setActiveWallet(null);
      setSigner(null);
      setBalance('0');
    }
  }, []);

  // 3. Define refreshUser now that dependencies are defined
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const { data } = await authAPI.getMe();
        if (data.success) {
          await _updateUserState(data.data);
          return true;
        }
      } catch (e) {
        console.error("Failed to refresh user session", e);
        logout();
      }
    }
    return false;
  }, [_updateUserState, logout]);

  // 4. UseEffect can now safely call refreshUser
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      await refreshUser();
      setLoading(false);
    };
    initAuth();
  }, [refreshUser]);

  const login = async (loginIdentifier, password) => {
    try {
      const { data } = await authAPI.login({ loginIdentifier, password });
      if (data.success) {
        setAuthToken(data.token);
        localStorage.setItem('token', data.token);
        await refreshUser(); // Fetch user details including wallets via getMe
        return true;
      }
    } catch (error) {
      throw error;
    }
    return false;
  };

  const addWallet = async (walletData) => {
      try {
          const { data } = await authAPI.addWallet(walletData);
          if (data.success) {
              await refreshUser();
              return true;
          }
      } catch (e) {
          console.error("Failed to add wallet:", e);
          throw e;
      }
      return false;
  };

  const switchActiveWallet = async (address) => {
      try {
          const { data } = await authAPI.setActiveWallet(address);
          if (data.success) {
              await refreshUser();
              return true;
          }
      } catch(e) {
          console.error("Failed to switch wallet", e);
      }
      return false;
  };

  const removeWallet = async (address) => {
    try {
        const { data } = await authAPI.deleteWallet(address);
        if (data.success) {
            await refreshUser();
            return true;
        }
    } catch (e) {
        console.error("Failed to delete wallet", e);
        throw e;
    }
    return false;
  };

  const contextValue = {
    user, loading, wallets, activeWallet, signer, balance,
    login, logout, addWallet, switchActiveWallet, removeWallet, refreshUser,
    account: activeWallet?.address,
  };

  return (
    <BlockchainContext.Provider value={contextValue}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => useContext(BlockchainContext);
