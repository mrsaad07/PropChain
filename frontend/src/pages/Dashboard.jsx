import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useBlockchain } from '../context/BlockchainContext';
import MaintenanceForm from '../components/MaintenanceForm';
import MaintenanceHistory from '../components/MaintenanceHistory';
import RentForm from '../components/RentForm';
import RentHistory from '../components/RentHistory';
import MyProperties from '../components/MyProperties';
import MyDeposits from '../components/MyDeposits';
import BuildingAdmin from '../components/BuildingAdmin';
import FinancialCharts from '../components/FinancialCharts';
import MyContracts from '../components/MyContracts';
import { authAPI, paymentAPI } from '../services/api';

const Dashboard = () => {
  const { account, loading, user } = useBlockchain();
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState(null);
  const [lastRentPayment, setLastRentPayment] = useState(null);
  const [maintenanceTargets, setMaintenanceTargets] = useState([]);
  const [paymentType, setPaymentType] = useState('rent');
  const [quickPayData, setQuickPayData] = useState(null);
  const [refreshHistory, setRefreshHistory] = useState(0);

  useEffect(() => {
    // Only fetch data if we have an account and are done loading
    if (!account || loading) return; 
    
    const fetchProfileAndData = async () => {
      try {
        const { data: profile } = await authAPI.getMe();
        setUserProfile(profile);

        // Fetch last rent payment for "Quick Pay" if tenant
        if (profile.userType === 'tenant') {
          try {
            const { data: rentData } = await paymentAPI.getTenantHistory(account, { limit: 1 });
            if (rentData.payments && rentData.payments.length > 0) {
               setLastRentPayment(rentData.payments[0]);
            }
          } catch (e) {
            console.warn("Could not fetch rent history", e);
          }
          
           // Mock maintenance targets for now
           setMaintenanceTargets([
             { buildingId: 'B-001', apartmentNo: '12', amount: 500 },
             { buildingId: 'B-002', apartmentNo: '5', amount: 750 }
           ]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchProfileAndData();
  }, [account, loading]);

  const handleUpdateRole = async (newRole) => {
      try {
          await authAPI.updateProfile({ userType: newRole });
          setUserProfile(prev => ({ ...prev, userType: newRole }));
      } catch (error) {
          console.error("Failed to update role", error);
      }
  };

  const handleQuickPayRent = () => {
      if (lastRentPayment) {
          setQuickPayData({
              propertyId: lastRentPayment.propertyId,
              amount: lastRentPayment.amount,
              month: lastRentPayment.month // assuming this exists
          });
          setPaymentType('rent');
          setActiveTab('payments');
      }
  };

  const handleSelectMaintenance = (target) => {
      setQuickPayData({
          buildingId: target.buildingId,
          apartmentNo: target.apartmentNo,
          amount: target.amount
      });
      setPaymentType('maintenance');
      setActiveTab('payments');
  };

  const handlePaymentSuccess = () => {
      setRefreshHistory(prev => prev + 1);
      setQuickPayData(null);
      // alert("Payment successful!");
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-blue-600 dark:text-blue-400 font-bold text-xl animate-pulse">Loading session...</div>
    </div>
  );

  if (!account) return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-[80vh] gap-6">
        {user ? (
           <div className="text-center">
             <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Almost there!</h2>
             <p className="text-gray-500 dark:text-gray-400 mb-6">You need to set up a wallet to access the dashboard features.</p>
             <a 
               href="/"
               className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition font-bold shadow-lg"
             >
               Finish Wallet Setup
             </a>
           </div>
        ) : (
           <p className="text-gray-500 dark:text-gray-400">Please connect your wallet to access dashboard.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${activeTab === 'overview' ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-100 dark:shadow-blue-900/50' : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${activeTab === 'profile' ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-100 dark:shadow-blue-900/50' : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'}`}
            >
              Profile & Settings
            </button>
            <button 
              onClick={() => setActiveTab('contracts')}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${activeTab === 'contracts' ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-100 dark:shadow-blue-900/50' : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'}`}
            >
              Contracts
            </button>
            <button 
              onClick={() => setActiveTab('my-properties')}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${activeTab === 'my-properties' ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-100 dark:shadow-blue-900/50' : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'}`}
            >
              My Properties
            </button>
            <button 
              onClick={() => setActiveTab('payments')}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${activeTab === 'payments' ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-100 dark:shadow-blue-900/50' : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'}`}
            >
              Payments
            </button>
            <button 
              onClick={() => setActiveTab('deposits')}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${activeTab === 'deposits' ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-100 dark:shadow-blue-900/50' : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'}`}
            >
              My Deposits
            </button>
            <button 
              onClick={() => setActiveTab('building-admin')}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${activeTab === 'building-admin' ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-100 dark:shadow-purple-900/50' : 'text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30'}`}
            >
              Building Admin
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Welcome Back!</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
                      <p className="text-blue-600 dark:text-blue-300 text-sm font-medium mb-1">Account</p>
                      <p className="text-xs font-mono text-gray-800 dark:text-gray-200 break-all">{account}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-600">
                      <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Current Role</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-100 capitalize">
                        {userProfile ? userProfile.userType : 'Loading...'}
                      </p>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 1. Pay Rent Action */}
                    {lastRentPayment ? (
                      <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-xl flex flex-col justify-between bg-gray-50 dark:bg-gray-700/50 hover:shadow-md transition cursor-pointer" onClick={handleQuickPayRent}>
                        <div>
                          <p className="font-bold text-gray-700 dark:text-gray-200">Pay Rent</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">Prop: {lastRentPayment.propertyId.substring(0, 10)}...</p>
                        </div>
                        <div className="mt-4 flex justify-between items-center text-sm">
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">Repeat &rarr;</span>
                        </div>
                      </div>
                    ) : (
                       <div className="border border-gray-200 dark:border-gray-700 border-dashed p-4 rounded-xl text-center text-gray-400 dark:text-gray-500 text-sm flex items-center justify-center">
                          No recent rents.
                       </div>
                    )}

                    {/* 2. Pay Maintenance Action */}
                    <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-xl flex flex-col bg-gray-50 dark:bg-gray-700/50 relative overflow-hidden">
                      <div className="mb-3">
                        <p className="font-bold text-gray-700 dark:text-gray-200">Pay Aidat</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Select property:</p>
                      </div>
                      
                      {maintenanceTargets.length > 0 ? (
                        <div className="flex-1 overflow-y-auto max-h-32 space-y-2 pr-1 custom-scrollbar">
                          {maintenanceTargets.map((target, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSelectMaintenance(target)}
                              className="w-full text-left text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 p-2 rounded hover:bg-green-50 dark:hover:bg-green-900/30 transition flex justify-between items-center group"
                            >
                              <span className="truncate max-w-[100px] font-medium text-gray-700 dark:text-gray-300">{target.buildingId}</span>
                              <span className="text-green-600 dark:text-green-400 opacity-0 group-hover:opacity-100 font-bold">Pay</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 dark:text-gray-500 text-center py-2 italic">
                          No active properties found.
                        </div>
                      )}
                    </div>
                    
                    {/* 3. My Properties Action */}
                    <button 
                      onClick={() => setActiveTab('my-properties')}
                      className="border border-gray-200 dark:border-gray-700 p-4 rounded-xl flex flex-col justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-left"
                    >
                       <div>
                          <p className="font-bold text-gray-700 dark:text-gray-200">My Properties</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage listings</p>
                        </div>
                        <div className="mt-4 text-blue-600 dark:text-blue-400 font-bold text-sm">View &rarr;</div>
                    </button>
                  </div>
                </div>
                
                <FinancialCharts />
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">Profile Settings</h2>
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Switch User Role</label>
                  <div className="flex gap-4">
                    {['tenant', 'owner', 'manager'].map(role => (
                      <button
                        key={role}
                        onClick={() => handleUpdateRole(role)}
                        className={`px-4 py-2 rounded-lg border capitalize transition ${userProfile?.userType === role ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                    <strong>Note:</strong> Switching roles here updates your user profile in the database. 
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'contracts' && <MyContracts />}
            {activeTab === 'my-properties' && <MyProperties />}
            {activeTab === 'deposits' && <MyDeposits />}
            {activeTab === 'building-admin' && <BuildingAdmin />}

            {activeTab === 'payments' && (
              <div>
                <div className="flex gap-4 mb-6">
                  <button 
                    onClick={() => setPaymentType('rent')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${paymentType === 'rent' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                  >
                    Rent Payments
                  </button>
                  <button 
                    onClick={() => setPaymentType('maintenance')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${paymentType === 'maintenance' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                  >
                    Maintenance Fees
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {paymentType === 'rent' ? (
                    <>
                      <RentForm onPaymentSuccess={handlePaymentSuccess} initialData={quickPayData} />
                      <RentHistory refreshTrigger={refreshHistory} />
                    </>
                  ) : (
                    <>
                      <MaintenanceForm onPaymentSuccess={handlePaymentSuccess} initialData={quickPayData} />
                      <MaintenanceHistory refreshTrigger={refreshHistory} />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
