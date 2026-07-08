import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FeedbackProvider } from './contexts/FeedbackContext';
import App from './App';
import './styles/global.css';
import 'flag-icons/css/flag-icons.min.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FeedbackProvider>
          <App />
        </FeedbackProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);