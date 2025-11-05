import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './i18n/config'

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} catch (error) {
  console.error('Failed to mount React app:', error);
  document.body.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-family: system-ui;
      text-align: center;
    ">
      <div>
        <h1>Error al cargar la aplicación</h1>
        <p>${error instanceof Error ? error.message : String(error)}</p>
        <p style="opacity: 0.8; margin-top: 20px;">Por favor, recarga la página.</p>
      </div>
    </div>
  `;
}
