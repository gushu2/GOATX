import React, { useState, useEffect } from 'react';
import LockScreen from './components/LockScreen';
import Vault from './components/Vault';
import { ViewState, VaultData } from './types';
import { getVault } from './services/storageService';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.LOCKED);
  const [vaultData, setVaultData] = useState<VaultData | null>(null);

  const handleUnlock = (code: string) => {
    const data = getVault(code);
    setVaultData(data);
    setViewState(ViewState.VAULT);
  };

  const handleLogout = () => {
    setVaultData(null);
    setViewState(ViewState.LOCKED);
  };

  // Add a subtle fade-in effect for the whole app
  return (
    <div className="min-h-screen bg-rv-bg text-rv-text selection:bg-rv-accent selection:text-white">
      {viewState === ViewState.LOCKED && (
        <LockScreen onUnlock={handleUnlock} />
      )}
      
      {viewState === ViewState.VAULT && vaultData && (
        <div className="animate-fade-in">
          <Vault 
            initialData={vaultData} 
            onLogout={handleLogout} 
          />
        </div>
      )}
      
      {/* Global CSS animation utility */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .shake {
          animation: shake 0.2s ease-in-out 0;
        }
      `}</style>
    </div>
  );
};

export default App;