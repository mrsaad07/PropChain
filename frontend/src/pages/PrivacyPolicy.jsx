import React from 'react';
import Navbar from '../components/Navbar';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Privacy Policy</h1>
          
          <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-4">
            <p><strong>Last Updated:</strong> December 21, 2025</p>

            <h2 className="text-xl font-bold">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you register for an account, such as your username and email address. Your password is encrypted and we cannot see it.</p>
            
            <h2 className="text-xl font-bold">2. How We Use Your Information</h2>
            <p>Your email address is used solely for the purposes of account authentication and, if you opt-in, for sending you occasional updates about our service. We do not share your personal information with third parties.</p>
            
            <h2 className="text-xl font-bold">3. Blockchain Privacy</h2>
            <p>Please be aware that while we strive to protect your account information, your wallet address and transactions are publicly visible on the blockchain network. Our "Anonymous Deposit" feature is designed to protect your identity during the initial bidding phase only.</p>

            <h2 className="text-xl font-bold">4. Data Security</h2>
            <p>We implement reasonable measures to help protect your information from loss, theft, and unauthorized access. However, no electronic transmission or storage is 100% secure.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
