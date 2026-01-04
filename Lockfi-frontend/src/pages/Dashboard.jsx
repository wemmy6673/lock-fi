import { useAccount, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';
import { Lock, Sun, Moon, Clock, Coins } from 'lucide-react';
import { useReadContract } from 'wagmi'
import { wagmiContractConfig } from '../../Contracts'




function Dashboard({ isDark, toggleTheme }) {
  const{ address: walletAddress } = useAccount();
  const { disconnect } = useDisconnect();
  const [activeLocks, setActiveLocks] = useState([
    { id: 1, amount: '500', endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), daysRemaining: 7 },
    { id: 2, amount: '250', endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), daysRemaining: 30 }
  ]);
  const [amount, setAmount] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [vaults, setVaults] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  const truncateAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };


const { data: balance } = useReadContract({
  ...wagmiContractConfig,
  functionName: 'balanceOf',
  args: walletAddress ? [walletAddress] : undefined,
  query: {
    enabled: !!walletAddress, // Only run if wallet is connected
  }
})
  const createVault = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!unlockDate) {
      setError('Please select an unlock date');
      return;
    }

    const selectedDate = new Date(unlockDate);
    const now = new Date();
    
    if (selectedDate <= now) {
      setError('Unlock date must be in the future');
      return;
    }

    const newVault = {
      id: Date.now(),
      amount: parseFloat(amount),
      unlockTime: selectedDate.getTime(),
      created: now.getTime(),
      isWithdrawn: false
    };

    setVaults([...vaults, newVault]);
    setAmount('');
    setUnlockDate('');
    setSuccess(`Vault created! ${amount} ETH locked until ${selectedDate.toLocaleString()}`);
    setError('');
    setTimeout(() => setSuccess(''), 5000);
  };

  const withdraw = (vaultId) => {
    const vault = vaults.find(v => v.id === vaultId);
    const now = Date.now();

    if (now < vault.unlockTime) {
      const timeLeft = Math.ceil((vault.unlockTime - now) / 1000 / 60);
      setError(`Vault is still locked! ${timeLeft} minutes remaining`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setVaults(vaults.map(v => 
      v.id === vaultId ? { ...v, isWithdrawn: true } : v
    ));
    setSuccess(`Successfully withdrawn ${vault.amount} ETH!`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const getTimeRemaining = (unlockTime) => {
    const now = Date.now();
    const diff = unlockTime - now;
    
    if (diff <= 0) return 'Unlocked';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTotalLocked = () => {
    return vaults
      .filter(v => !v.isWithdrawn)
      .reduce((sum, v) => sum + v.amount, 0)
      .toFixed(4);
  };


  const handleLockTokens = () => {
    if (!lockedAmount || !lockDuration) {
      alert('Please enter both amount and duration');
      return;
    }

    const amount = parseFloat(lockedAmount);
    const duration = parseInt(lockDuration);

    if (amount <= 0 || duration <= 0) {
      alert('Amount and duration must be positive numbers');
      return;
    }

    if (amount > parseFloat(tokenBalance.replace(',', ''))) {
      alert('Insufficient balance');
      return;
    }

    const endDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
    const newLock = {
      id: activeLocks.length + 1,
      amount: lockedAmount,
      endDate: endDate,
      daysRemaining: duration
    };

    setActiveLocks([...activeLocks, newLock]);
    setTokenBalance((parseFloat(tokenBalance.replace(',', '')) - amount).toLocaleString());
    setLockedAmount('');
    setLockDuration('');
    alert('Tokens locked successfully!');
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`border-b transition-colors duration-300 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="lg:w-3/4 mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isDark ? 'bg-gradient-to-br from-purple-600 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-blue-500'
            }`}>
              <Lock size={24} className="text-white" />
            </div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Lock-fi
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg font-mono text-sm ${
              isDark ? 'bg-gray-700 text-green-400' : 'bg-gray-100 text-green-600'
            }`}>
              {truncateAddress(walletAddress)}
            </div>
            
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={() => disconnect()}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 ${
                isDark
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:w-3/4 mx-auto px-6 py-8">
        {/* Balance Card */}
        <div className={`rounded-xl px-6 py-16 mb-8 transition-colors duration-300 ${
          isDark 
            ? 'bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-purple-700/50' 
            : 'bg-gradient-to-br from-purple-100 to-blue-100 border border-purple-300 shadow-lg'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <Coins size={24} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Available Balance
            </h3>
          </div>
          <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {balance?.toString()} WILDCOINS
          </p>
        </div>
        
      <div className={`rounded-xl px-6 py-16 mb-8 transition-colors duration-300 ${
          isDark 
            ? 'bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-purple-700/50' 
            : 'bg-gradient-to-br from-purple-100 to-blue-100 border border-purple-300 shadow-lg'
        }`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Lock className="text-purple-300" size={24} />
                Create New Vault
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-purple-200 mb-2">Amount (ETH)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className={`w-full bg-white bg-opacity-10 border border-purple-400 rounded-lg px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'} placeholder-purple-300 focus:outline-none focus:border-purple-300`}
                  />
                </div>

                <div>
                  <label className="block text-purple-200 mb-2">Unlock Date & Time</label>
                  <input
                    type="datetime-local"
                    value={unlockDate}
                    onChange={(e) => setUnlockDate(e.target.value)}
                    className={`w-full bg-white bg-opacity-10 border border-purple-400 rounded-lg px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'} focus:outline-none focus:border-purple-300`}
                  />
                </div>

                <button
                  onClick={createVault}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Lock size={20} />
                  Lock Funds
                </button>
              </div>
            </div>

            {/* Vaults List */}
            <div className={`bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2`}>
                <Clock className="text-purple-300" size={24} />
                Your Vaults
              </h2>

              {vaults.length === 0 ? (
                <div className="text-center py-12">
                  <Lock className="mx-auto mb-4 text-purple-300 opacity-50" size={48} />
                  <p className="text-purple-300">No vaults created yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vaults.map((vault) => {
                    const isUnlocked = currentTime >= vault.unlockTime;
                    return (
                      <div
                        key={vault.id}
                        className={`bg-white bg-opacity-10 border ${
                          vault.isWithdrawn
                            ? 'border-gray-500'
                            : isUnlocked
                            ? 'border-green-400'
                            : 'border-purple-400'
                        } rounded-lg p-4`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            {vault.isWithdrawn ? (
                              <Unlock className="text-gray-400" size={20} />
                            ) : isUnlocked ? (
                              <Unlock className="text-green-400" size={20} />
                            ) : (
                              <Lock className="text-purple-300" size={20} />
                            )}
                            <span className="text-white font-bold text-xl">{vault.amount} ETH</span>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              vault.isWithdrawn
                                ? 'bg-gray-500 text-gray-200'
                                : isUnlocked
                                ? 'bg-green-500 text-white'
                                : 'bg-purple-500 text-white'
                            }`}
                          >
                            {vault.isWithdrawn ? 'Withdrawn' : getTimeRemaining(vault.unlockTime)}
                          </span>
                        </div>
                        
                        <div className="text-purple-200 text-sm mb-3">
                          <p>Unlocks: {new Date(vault.unlockTime).toLocaleString()}</p>
                          <p>Created: {new Date(vault.created).toLocaleString()}</p>
                        </div>

                        {!vault.isWithdrawn && (
                          <button
                            onClick={() => withdraw(vault.id)}
                            disabled={!isUnlocked}
                            className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                              isUnlocked
                                ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {isUnlocked ? 'Withdraw' : 'Locked'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
      </div>
    </div>
  );
}
export default Dashboard;