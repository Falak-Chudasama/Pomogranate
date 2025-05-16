import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import App from './App.jsx'

// in main.jsx or App.jsx
import { useEffect } from 'react'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
    onNeedRefresh() {
        if (confirm('New version available. Reload?')) {
            updateSW(true)
        }
    }
})


serviceWorkerRegistration.register();

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);