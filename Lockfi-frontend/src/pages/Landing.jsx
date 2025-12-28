import { useState } from 'react';
import { Lock, Sun, Moon, Clock, Coins } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';


// Landing Page Component
function Landing({ onConnect, isDark, toggleTheme }) {
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-black' : 'bg-gray-50'
    }`}>
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-lg transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
              : 'bg-white hover:bg-gray-100 text-gray-800 shadow-md'
          }`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo Icon */}
        <div className={`mb-8 p-8 rounded-full transition-colors duration-300 ${
          isDark 
            ? 'bg-gradient-to-br from-purple-600 to-blue-600' 
            : 'bg-gradient-to-br from-purple-500 to-blue-500 shadow-xl'
        }`}>
          <Lock size={80} className="text-white" />
        </div>

        {/* Title */}
        <h1 className={`text-5xl font-bold mb-12 transition-colors duration-300 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Lock-fi
        </h1>

        {/* Connect Wallet Button - Replace with RainbowKit's ConnectButton */}
         {/* RainbowKit Connect Button with Custom Styling */}
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  style: {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        type="button"
                        className={`px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300 ${
                          isDark
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/50'
                            : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-xl'
                        }`}
                      >
                        Connect Wallet
                      </button>
                    );
                  }
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>

        <p className={`mt-8 text-sm transition-colors duration-300 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Connect your wallet to lock or access unlocked tokens.
        </p>
      </div>
    </div>
  );
}
export default Landing;