import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlockchain } from '../context/BlockchainContext';
import { useNotification } from '../context/NotificationContext';
import Navbar from '../components/Navbar';
import FloatingEmojis from '../components/FloatingEmojis';
import { User, Lock } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    loginIdentifier: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useBlockchain();
  const { notify } = useNotification();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('[Login Page] Submitting with:', { loginIdentifier: formData.loginIdentifier, password: '***' });
    try {
      const success = await login(formData.loginIdentifier, formData.password);
      if (success) {
        notify('Login successful! Welcome back.', 'success');
        navigate('/');
      } else {
        // This case might be rare if login function throws on failure
        notify('Login failed. Please check your credentials.', 'error');
        console.error('[Login Page] login() returned false.');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      console.error('[Login Page] Error caught:', err.response?.data || err.message);
      notify(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 relative overflow-hidden">
      <FloatingEmojis />
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4 relative z-10">
        <div className="w-full max-w-md space-y-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-10 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Sign in to continue to PropChain.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="loginIdentifier"
                  type="text"
                  autoComplete="username"
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/70 dark:bg-gray-700/80 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Username or Email"
                  onChange={handleChange}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/70 dark:bg-gray-700/80 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Password"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 dark:disabled:bg-gray-600"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
             <p className="text-center text-sm">
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                    Don't have an account? Register
                </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;