import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const faqs = [
  {
    question: 'What is PropChain?',
    answer: 'PropChain is a demonstration platform that uses blockchain technology to create a transparent and secure system for property rentals, sales, and management. All transactions are recorded on a local test blockchain.',
  },
  {
    question: 'Do I need real cryptocurrency to use the platform?',
    answer: 'No. This is a demo application that runs on a local Ganache testnet. When you create a "Demo Wallet," it is automatically funded with free, valueless test ETH for you to use on the platform.',
  },
  {
    question: 'Is my personal information secure?',
    answer: 'We take privacy seriously. Your password is encrypted and cannot be seen by anyone. Your email, if you provide it, is only used for account purposes. While your wallet address is public on the blockchain, features like our Anonymous Deposit Queue help protect your identity during sensitive operations.',
  },
  {
    question: 'How does the Anonymous Deposit Queue work?',
    answer: 'When you place a deposit on a property, the system generates a unique, anonymous ID for you. The property owner and the public can only see this anonymous ID in the queue, not your actual wallet address. Your identity is only revealed to the owner if they accept your deposit.',
  },
  {
    question: 'Can I connect my own wallet?',
    answer: 'Yes! We support connecting your own browser-based wallet, like MetaMask. You can manage all your connected wallets, including our free Demo Wallet, from the "My Wallets" page.',
  },
];

const HelpCenterPage = () => {
  const [open, setOpen] = useState(null);

  const toggle = (index) => {
    if (open === index) {
      return setOpen(null);
    }
    setOpen(index);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              Help Center
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Frequently Asked Questions
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex justify-between items-center p-6 text-left"
                >
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{faq.question}</h2>
                  <span className={`transform transition-transform duration-300 ${open === index ? 'rotate-45' : 'rotate-0'}`}>
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open === index ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="p-6 pt-0">
                    <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpCenterPage;
