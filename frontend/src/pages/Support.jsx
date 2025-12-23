import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { BookOpen, Mail } from 'lucide-react';

const SupportPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              PropChain Support
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              We're here to help you get the most out of our platform.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/help-center" className="block p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center">
                  <BookOpen size={28} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Help Center</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Find answers to frequently asked questions, learn how to use platform features, and read our detailed guides.
              </p>
            </Link>

            <Link to="/contact" className="block p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300 rounded-full flex items-center justify-center">
                  <Mail size={28} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Contact Us</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Have a specific question or need to report an issue? Get in touch with our support team directly.
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupportPage;
