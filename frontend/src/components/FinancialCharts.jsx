import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { paymentAPI, depositAPI } from '../services/api';
import { useBlockchain } from '../context/BlockchainContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const FinancialCharts = () => {
  const { account } = useBlockchain();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!account) return;
      setLoading(true);
      try {
        const [maintenanceRes, rentRes, depositRes] = await Promise.all([
          paymentAPI.getMaintenanceHistory(account),
          paymentAPI.getTenantHistory(account),
          depositAPI.getMyDeposits()
        ]);
        
        const expenses = [...maintenanceRes.data.data, ...rentRes.data.data];
        const deposits = depositRes.data.data;
        
        const allMonths = new Set();
        const expensesByMonth = {};
        const depositsByMonth = {};

        expenses.forEach(p => {
          const month = p.month; // Assumes YYYY-MM format
          allMonths.add(month);
          if (!expensesByMonth[month]) expensesByMonth[month] = 0;
          expensesByMonth[month] += p.amount;
        });

        deposits.forEach(d => {
          const month = new Date(d.createdAt).toISOString().slice(0, 7); // Convert date to YYYY-MM
          allMonths.add(month);
          if (!depositsByMonth[month]) depositsByMonth[month] = 0;
          depositsByMonth[month] += d.amount;
        });

        const labels = Array.from(allMonths).sort();
        
        const expenseData = labels.map(label => expensesByMonth[label] || 0);
        const depositData = labels.map(label => depositsByMonth[label] || 0);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Refundable Deposits',
              data: depositData,
              backgroundColor: 'rgba(53, 162, 235, 0.3)', // Faded blue
              borderColor: 'rgb(53, 162, 235)',
              borderWidth: 1,
            },
            {
              label: 'Expenses (Rent + Fees)',
              data: expenseData,
              backgroundColor: 'rgba(53, 162, 235, 0.8)', // Solid blue
              borderColor: 'rgb(53, 162, 235)',
              borderWidth: 1,
            },
          ],
        });

      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [account]);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true },
    },
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mt-6 h-96 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 animate-pulse">Loading Chart Data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mt-6">
      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Financial Overview</h3>
      {chartData && <Bar options={options} data={chartData} />}
    </div>
  );
};

export default FinancialCharts;