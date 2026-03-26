import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { injectStore } from './services/axiosClient';
import { injectOfflineStore } from './services/offlineManager';
import App from './App';
import './styles/global.css';
import hospitalIcon from './assets/icons/hospital.png';

// Inject redux store into services
injectStore(store);
// Inject redux store into Offline Manager to allow UI refreshes after sync
injectOfflineStore(store);

// Set favicon from src assets
document.querySelector("link[rel*='icon']").href = hospitalIcon;

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  // <React.StrictMode>
  <Provider store={store}>
    <App />
  </Provider>
  //</React.StrictMode>
);
