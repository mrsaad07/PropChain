import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import FloatingEmojis from '../components/FloatingEmojis';
import { User, Lock } from 'lucide-react';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!agreed) {
      return setError("You must agree to the terms and privacy policy.");
    }
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }
    setLoading(true);

    try {
      const { data } = await authAPI.register({
        username: formData.username,
        password: formData.password,
      });

      if (data.success) {
        toast.success('Registration successful! Please log in.');
        navigate('/login');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'An error occurred.');
      } else {
        setError('Server not responding. Please try again later.');
      }
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
              Create Your Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Join the future of real estate.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">{error}</div>}
            
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="username"
                  type="text"
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/70 dark:bg-gray-700/80 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Username"
                  onChange={handleChange}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/70 dark:bg-gray-700/80 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Password"
                  onChange={handleChange}
                />
              </div>
               <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/70 dark:bg-gray-700/80 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Confirm Password"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-center">
              <input id="terms" name="terms" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                I agree to the <Link to="/terms-of-service" target="_blank" className="font-medium text-blue-600 hover:underline">Terms</Link> and <Link to="/privacy-policy" target="_blank" className="font-medium text-blue-600 hover:underline">Privacy Policy</Link>.
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !agreed}
                className="w-full flex justify-center rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 dark:disabled:bg-gray-600"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
             <p className="text-center text-sm">
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Already have an account? Sign In
                </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
