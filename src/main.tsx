import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AppProvider } from './context/AppContext';
import { CitizenProvider } from './context/CitizenContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <CitizenProvider>
        <App />
      </CitizenProvider>
    </AppProvider>
  </React.StrictMode>
);
