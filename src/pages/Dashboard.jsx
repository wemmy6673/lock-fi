import { useAccount, useDisconnect } from 'wagmi';
import { useState } from 'react';
import { Lock, Sun, Moon, Clock, Coins } from 'lucide-react';


function Dashboard({ isDark, toggleTheme }) {
  const{ address: walletAddress } = useAccount();
  const { disconnect } = useDisconnect();
  const [tokenBalance, setTokenBalance] = useState('1,250.50');
  const [lockedAmount, setLockedAmount] = useState('');
  const [lockDuration, setLockDuration] = useState('');
  const [activeLocks, setActiveLocks] = useState([
    { id: 1, amount: '500', endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), daysRemaining: 7 },
    { id: 2, amount: '250', endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), daysRemaining: 30 }
  ]);

  const truncateAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isDark ? 'bg-gradient-to-br from-purple-600 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-blue-500'
            }`}>
              <Lock size={24} className="text-white" />
            </div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Token Locker
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
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Balance Card */}
        <div className={`rounded-xl p-6 mb-8 transition-colors duration-300 ${
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
            {tokenBalance} TOKENS
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Lock Tokens Section */}
          <div className={`rounded-xl p-6 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-md'
          }`}>
            <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Lock Tokens
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Amount to Lock
                </label>
                <input
                  type="number"
                  value={lockedAmount}
                  onChange={(e) => setLockedAmount(e.target.value)}
                  placeholder="0.00"
                  className={`w-full px-4 py-3 rounded-lg transition-colors duration-300 ${
                    isDark 
                      ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Lock Duration (days)
                </label>
                <input
                  type="number"
                  value={lockDuration}
                  onChange={(e) => setLockDuration(e.target.value)}
                  placeholder="0"
                  className={`w-full px-4 py-3 rounded-lg transition-colors duration-300 ${
                    isDark 
                      ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
              </div>

              <button
                onClick={handleLockTokens}
                className={`w-full py-3 font-semibold rounded-lg transition-all duration-300 ${
                  isDark
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-md'
                }`}
              >
                Lock Tokens
              </button>
            </div>
          </div>

          {/* Active Locks Section */}
          <div className={`rounded-xl p-6 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-md'
          }`}>
            <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Active Locks
            </h3>
            
            <div className="space-y-3">
              {activeLocks.length === 0 ? (
                <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No active locks
                </p>
              ) : (
                activeLocks.map((lock) => (
                  <div
                    key={lock.id}
                    className={`p-4 rounded-lg transition-colors duration-300 ${
                      isDark ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Lock size={18} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                        <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {lock.amount} TOKENS
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                      }`}>
                        Locked
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <Clock size={14} />
                      <span>Unlocks: {formatDate(lock.endDate)}</span>
                    </div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {lock.daysRemaining} days remaining
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Dashboard;