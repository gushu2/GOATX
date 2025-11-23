import React, { useState, useEffect } from 'react';

interface LockScreenProps {
  onUnlock: (code: string) => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleNumberClick = (num: string) => {
    if (input.length < 3) {
      const newInput = input + num;
      setInput(newInput);
      if (newInput.length === 3) {
        // Slight delay for UX
        setTimeout(() => onUnlock(newInput), 300);
      }
    }
  };

  const handleBackspace = () => {
    setInput(input.slice(0, -1));
    setError(false);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleNumberClick(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-rv-bg text-rv-text p-4">
      <div className="mb-12 text-center animate-fade-in">
        <h1 className="text-6xl font-bold tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">RV</h1>
        <p className="text-rv-muted text-sm uppercase tracking-[0.3em]">Secure Note Vault</p>
      </div>

      <div className="w-full max-w-xs">
        {/* Display */}
        <div className={`mb-8 flex justify-center gap-4 transition-all duration-300 ${error ? 'shake' : ''}`}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-16 h-20 rounded-xl border-2 flex items-center justify-center text-4xl font-mono transition-all duration-200 
                ${input[i] 
                  ? 'border-rv-accent bg-rv-accent/10 text-rv-accent shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                  : 'border-rv-border bg-rv-card text-gray-600'}`}
            >
              {input[i] || '•'}
            </div>
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              disabled={input.length >= 3}
              className="h-16 rounded-xl bg-rv-card hover:bg-rv-border border border-rv-border text-xl font-medium transition-all active:scale-95 disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          <div className="h-16"></div> {/* Empty slot */}
          <button
            onClick={() => handleNumberClick('0')}
            disabled={input.length >= 3}
            className="h-16 rounded-xl bg-rv-card hover:bg-rv-border border border-rv-border text-xl font-medium transition-all active:scale-95 disabled:opacity-50"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-16 rounded-xl bg-rv-card hover:bg-red-900/20 border border-rv-border hover:border-red-900/50 text-xl font-medium transition-all active:scale-95 flex items-center justify-center group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rv-muted group-hover:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
            </svg>
          </button>
        </div>
      </div>
      
      <p className="mt-12 text-xs text-rv-muted/50 max-w-xs text-center">
        Enter your 3-digit access code to retrieve your vault. 
        <br/>Data is stored locally on this device.
      </p>
    </div>
  );
};

export default LockScreen;