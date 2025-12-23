import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Layers, Lock } from 'lucide-react';

const LandingPage = ({ onLoginClick }) => {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-white dark:bg-gray-800/20 pt-20 pb-24 text-center border-b border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-b dark:border-slate-100/5"></div>
        <div className="relative max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            PropChain
            <span className="block text-blue-600 dark:text-blue-400 mt-2">The future of decentralized property management.</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Secure, transparent, and efficient.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/properties"
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-blue-500/20"
            >
              Explore Properties
            </Link>
            <Link
              to="/login"
              className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Register / Login
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 dark:bg-slate-900 py-24">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Blockchain Secured</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Every transaction, from deposits to rent payments, is recorded on an immutable blockchain, ensuring full transparency and trust.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center mb-4">
              <Lock size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Anonymous Deposits</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Join a property's deposit queue without revealing your identity. Your privacy is protected until your offer is accepted.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center mb-4">
              <Layers size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Decentralized Management</h3>
            <p className="text-gray-600 dark:text-gray-400">
              A free and open platform for property owners and tenants, removing the need for costly intermediaries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
