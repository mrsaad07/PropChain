import React from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BlockExplorer from '../components/BlockExplorer';
import UserHomepage from './UserHomepage';
import LandingPage from './LandingPage';

const Home = () => {
  const { user, loading } = useBlockchain();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-blue-600 dark:text-blue-400 font-bold text-xl animate-pulse">Loading Session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col font-sans">
      <Navbar />
      
      {user ? (
        // If user is logged in, show the personalized UserHomepage
        <UserHomepage />
      ) : (
        // Otherwise, show the main marketing/landing page
        <>
          <LandingPage onLoginClick={() => navigate('/login')} />
          <div className="bg-gray-50 dark:bg-slate-900 py-12 px-4">
            <BlockExplorer />
          </div>
        </>
      )}
    </div>
  );
};

export default Home;