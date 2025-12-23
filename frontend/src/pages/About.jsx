import React from 'react';
import Navbar from '../components/Navbar';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              About <span className="text-blue-600 dark:text-blue-400">PropChain</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              The future of decentralized property management. Secure, transparent, and efficient.
            </p>
          </div>

          <div className="mt-12 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Our mission is to revolutionize the real estate industry by leveraging the power of blockchain technology. We aim to create a trustless, transparent, and user-centric ecosystem where property transactions are seamless, secure, and free from the inefficiencies of traditional systems. By placing control back into the hands of owners and tenants, we are building a new standard for property management.
            </p>

            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Our Vision</h2>
            <p className="text-gray-600 dark:text-gray-300">
              We envision a global real estate market where every lease agreement, deposit, and payment is recorded on an immutable ledger, accessible to all relevant parties. This transparency eliminates disputes, reduces fraud, and fosters a healthier relationship between landlords and tenants. PropChain aims to be the foundational platform for this new, decentralized future.
            </p>

            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">The Technology</h2>
            <p className="text-gray-600 dark:text-gray-300">
              PropChain is built on a foundation of cutting-edge, open-source technologies. Our smart contracts handle all critical logic for deposits, rent, and maintenance fees, ensuring that rules are enforced automatically and impartially. All data is managed on a local, free-to-use blockchain, meaning there are no gas fees or cryptocurrency required for this demonstration.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
