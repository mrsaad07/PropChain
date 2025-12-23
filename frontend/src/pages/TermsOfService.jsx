import React from 'react';
import Navbar from '../components/Navbar';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Terms of Service</h1>
          
          <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-4">
            <p><strong>Last Updated:</strong> December 21, 2025</p>

            <h2 className="text-xl font-bold">1. Introduction</h2>
            <p>Welcome to PropChain ("we", "us", "our"). By accessing or using our application, you agree to be bound by these Terms of Service. This is a demonstration application and should not be used for real financial transactions.</p>
            
            <h2 className="text-xl font-bold">2. Use of Service</h2>
            <p>You agree to use our service for demonstration and testing purposes only. You must not use the service for any illegal or unauthorized purpose. All blockchain interactions occur on a local test network (Ganache) and do not involve real cryptocurrency.</p>
            
            <h2 className="text-xl font-bold">3. User Accounts</h2>
            <p>You are responsible for safeguarding your account information. The custodial "Demo Wallets" are provided for convenience in this demo environment; in a real-world scenario, you would be solely responsible for your private keys.</p>

            <h2 className="text-xl font-bold">4. Disclaimer of Warranties</h2>
            <p>The service is provided "as is" without any warranties, express or implied. We do not warrant that the service will be uninterrupted, secure, or error-free.</p>

            <h2 className="text-xl font-bold">5. Limitation of Liability</h2>
            <p>In no event shall PropChain be liable for any indirect, incidental, or consequential damages arising out of your use of this demonstration application.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
