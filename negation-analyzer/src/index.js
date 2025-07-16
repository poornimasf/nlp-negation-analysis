import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: 'us-east-1', // Your preferred region
    userPoolId: 'POOL_ID', // Will be updated after running amplify add auth
    userPoolWebClientId: 'CLIENT_ID', // Will be updated after running amplify add auth
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
