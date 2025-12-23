import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/tailwind.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { BlockchainProvider } from './context/BlockchainContext';
import { NotificationProvider } from './context/NotificationContext';
import { WishlistProvider } from './context/WishlistContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <NotificationProvider>
          <WishlistProvider>
            <ThemeProvider>
              <BlockchainProvider>
                <App />
              </BlockchainProvider>
            </ThemeProvider>
          </WishlistProvider>
        </NotificationProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);