import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Adjust the import based on the actual file name
import './index.css'; // Importing the CSS file

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);