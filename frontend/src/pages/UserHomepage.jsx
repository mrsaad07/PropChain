import React from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { Link } from 'react-router-dom';
import { Wallet, Building, ArrowRight, UserCheck } from 'lucide-react';

// A reusable card component for the dashboard
const ActionCard = ({ to, icon, title, children }) => (
  <Link to={to} className="block p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all transform hover:-translate-y-1">
    <div className="flex items-center gap-4 mb-3">
      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
    </div>
    <p className="text-gray-600 dark:text-gray-400">{children}</p>
    <div className="mt-4 font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
      Continue <ArrowRight size={16} />
    </div>
  </Link>
);

const UserHomepage = () => {
  const { user, account } = useBlockchain();

  // Determine the primary "Next Step" for the user
  const renderNextStep = () => {
    if (!account) {
      return (
        <ActionCard
          to="/wallet"
          icon={<Wallet size={24} />}
          title="First Step: Set Up Your Wallet"
        >
          To interact with properties and make transactions, you need a wallet. Create a free demo wallet or connect your own.
        </ActionCard>
      );
    }
    // Logic can be expanded here for other roles
    if (user.roles.includes('owner')) {
        return (
            <ActionCard
                to="/properties/create"
                icon={<Building size={24} />}
                title="List Your First Property"
            >
                Start earning by listing your apartment, house, or commercial space on the most transparent platform.
            </ActionCard>
        );
    }
    // Default for tenants
    return (
        <ActionCard
            to="/properties"
            icon={<Building size={24} />}
            title="Find Your Next Home"
        >
            Explore our secure listings and find the perfect property to rent or buy. Place your deposit with confidence.
        </ActionCard>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Welcome back, <span className="text-blue-600 dark:text-blue-400">{user.username}!</span>
        </h1>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <UserCheck size={14} className="mr-2"/>
            <span>Last login: {new Date(user.lastLoginAt).toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-10">
        <div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">Your Next Step</h2>
            {renderNextStep()}
        </div>
        
        <div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ActionCard to="/dashboard" icon={<Building size={20} />} title="Full Dashboard">
                    Access all features like payments, deposits, and contracts.
                </ActionCard>
                <ActionCard to="/wallet" icon={<Wallet size={20} />} title="Manage Wallets">
                    Add a new wallet or change your active one.
                </ActionCard>
                 <ActionCard to="/properties" icon={<Building size={20} />} title="Browse Properties">
                    View all available listings for rent or sale.
                </ActionCard>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserHomepage;
