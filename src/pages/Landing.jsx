import { useState } from 'react';
import { Lock, Sun, Moon } from 'lucide-react';
import '@rainbow-me/rainbowkit/styles.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';


export default function DAppLanding() {
  const [isDark, setIsDark] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Failed to connect wallet. Please try again.');
      }
    } else {
      alert('Please install MetaMask or another Web3 wallet to connect.');
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const truncateAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

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

        {/* Connect Wallet Button */}
        {!isConnected ? (
          <ConnectButton
            onClick={connectWallet}
            className={`px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 ${
              isDark
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/50'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-xl'
            }`}
          >
            Connect Wallet
          </ConnectButton>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className={`px-6 py-3 rounded-lg font-mono transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-800 text-green-400' 
                : 'bg-white text-green-600 shadow-md'
            }`}>
              {truncateAddress(walletAddress)}
            </div>
            <button
              onClick={disconnectWallet}
              className={`px-6 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 ${
                isDark
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-md'
              }`}
            >
              Disconnect
            </button>
          </div>
        )}

        {/* Status Text */}
        <p className={`mt-8 text-sm transition-colors duration-300 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {isConnected ? 'Wallet connected successfully' : 'Connect your wallet to get started'}
        </p>
      </div>
    </div>
  );
}