import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

//import { CssBaseline } from '@mui/material'; // Clean MUI reset foundation

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      {/* <CssBaseline /> */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);