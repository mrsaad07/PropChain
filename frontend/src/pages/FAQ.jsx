import React from 'react';
import Navbar from '../components/Navbar';

const FAQ = () => {
  const faqs = [
    {
      q: "How does PropChain work?",
      a: "PropChain uses blockchain technology to create a transparent ledger for property rentals, deposits, and payments."
    },
    {
      q: "Do I need real Ethereum?",
      a: "No, our platform runs on a test network or uses a demo custodial wallet system."
    },
    {
      q: "Is my data secure?",
      a: "Yes, critical transaction data is stored on the blockchain, making it immutable and secure."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">Frequently Asked Questions</h1>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">{faq.q}</h3>
              <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
