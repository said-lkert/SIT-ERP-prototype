import {StrictMode, useState} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SettingsProvider } from './components/settings/SettingsContext.tsx';
import { TranslatorProvider } from './lib/TranslatorProvider.tsx';
import { ModuleProvider } from './contexts/ModuleContext.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';

function ApplicationGate() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('sit-erp-authenticated') === 'true',
  );

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLogin={() => {
          sessionStorage.setItem('sit-erp-authenticated', 'true');
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <App
      onLogout={() => {
        sessionStorage.removeItem('sit-erp-authenticated');
        setIsAuthenticated(false);
      }}
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <TranslatorProvider>
        <ModuleProvider>
          <ApplicationGate />
        </ModuleProvider>
      </TranslatorProvider>
    </SettingsProvider>
  </StrictMode>,
);
