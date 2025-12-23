import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEthPriceInTry } from '../utils/currency';

const Footer = () => {
  const [rates, setRates] = useState({ eth: 0, usd: 34.50, eur: 36.20 });

  useEffect(() => {
    const fetchRates = async () => {
      const eth = await getEthPriceInTry();
      setRates(prev => ({ ...prev, eth }));
    };
    fetchRates();
  }, []);

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">PropChain</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              The future of decentralized property management. Secure, transparent, and efficient.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/properties" className="hover:text-blue-500">Properties</Link></li>
              <li><Link to="/dashboard" className="hover:text-blue-500">Dashboard</Link></li>
              <li><Link to="/about" className="hover:text-blue-500">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/help-center" className="hover:text-blue-500">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-blue-500">Contact Us</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-blue-500">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4">Live Rates</h4>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">ETH/TRY</span>
                <span className="text-green-600">{rates.eth.toLocaleString()} ₺</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">USD/TRY</span>
                <span className="text-gray-800 dark:text-gray-300">{rates.usd} ₺</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">EUR/TRY</span>
                <span className="text-gray-800 dark:text-gray-300">{rates.eur} ₺</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8 text-center text-xs text-gray-400">
          © 2025 PropChain Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
