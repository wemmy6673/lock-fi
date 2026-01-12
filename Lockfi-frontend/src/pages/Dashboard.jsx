import { useAccount, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';
import { Lock, Sun, Moon, Clock, Coins, Unlock } from 'lucide-react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { wagmiContractConfig } from '../../contract';
import { lockContractConfig } from '../../lock';

function Dashboard({ isDark, toggleTheme }) {
  const { address: walletAddress } = useAccount();
  const { disconnect } = useDisconnect();
  const [amount, setAmount] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  const truncateAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get token decimals
  const { data: decimals } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'decimals',
  });

  // Get token balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'balanceOf',
    args: [walletAddress],
    query: {
      enabled: !!walletAddress,
    },
  });

  // Get user's vault count
  const { data: vaultCountData, refetch: refetchVaultCount } = useReadContract({
    ...lockContractConfig,
    functionName: 'vaultCount',
    args: [walletAddress],
    query: {
      enabled: !!walletAddress,
    },
  });

  // Get user's vault IDs
  const { data: vaultIds, refetch: refetchVaultIds } = useReadContract({
    ...lockContractConfig,
    functionName: 'getUserVaults',
    args: [walletAddress],
    query: {
      enabled: !!walletAddress,
    },
  });

  // Format balance
  const formattedBalance = balance && decimals 
    ? parseFloat(formatUnits(balance, decimals)).toFixed(4)
    : '0.0000';

  // Approve tokens
  const { writeContract: approveTokens, data: approveHash } = useWriteContract();
  const { isLoading: isApproving, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ 
    hash: approveHash 
  });

  // Create vault
  const { writeContract: createVaultTx, data: createHash } = useWriteContract();
  const { isLoading: isCreating, isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({ 
    hash: createHash 
  });

  // Withdraw from vault
  const { writeContract: withdrawFromVault, data: withdrawHash } = useWriteContract();
  const { isLoading: isWithdrawing, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({ 
    hash: withdrawHash 
  });

  // Handle successful approval
  useEffect(() => {
    if (isApproveSuccess) {
      setSuccess('Tokens approved! You can now create vaults.');
      setTimeout(() => setSuccess(''), 5000);
    }
  }, [isApproveSuccess]);

  // Handle successful vault creation
  useEffect(() => {
    if (isCreateSuccess) {
      refetchVaultCount();
      refetchVaultIds();
      refetchBalance();
      setAmount('');
      setUnlockDate('');
      setSuccess('Vault created successfully!');
      setTimeout(() => setSuccess(''), 5000);
    }
  }, [isCreateSuccess]);

  // Handle successful withdrawal
  useEffect(() => {
    if (isWithdrawSuccess) {
      refetchVaultIds();
      refetchBalance();
      setSuccess('Tokens withdrawn successfully!');
      setTimeout(() => setSuccess(''), 5000);
    }
  }, [isWithdrawSuccess]);

  const handleApprove = async () => {
    try {
      const amountToApprove = parseUnits('1000000', decimals || 18); // Approve large amount
      
      approveTokens({
        ...wagmiContractConfig,
        functionName: 'approve',
        args: [lockContractConfig.address, amountToApprove],
      });
    } catch (err) {
      setError('Approval failed: ' + err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleCreateVault = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (!unlockDate) {
      setError('Please select an unlock date');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const selectedDate = new Date(unlockDate);
    const now = new Date();
    
    if (selectedDate <= now) {
      setError('Unlock date must be in the future');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const tokenAmount = parseUnits(amount, decimals || 18);
      const unlockTimestamp = Math.floor(selectedDate.getTime() / 1000);

      createVaultTx({
        ...lockContractConfig,
        functionName: 'createVault',
        args: [tokenAmount, BigInt(unlockTimestamp)],
      });
    } catch (err) {
      setError('Failed to create vault: ' + err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleWithdraw = async (vaultId) => {
    try {
      withdrawFromVault({
        ...lockContractConfig,
        functionName: 'withdraw',
        args: [BigInt(vaultId)],
      });
    } catch (err) {
      setError('Withdrawal failed: ' + err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTimeRemaining = (unlockTime) => {
    const now = Date.now();
    const diff = Number(unlockTime) * 1000 - now;
    
    if (diff <= 0) return 'Unlocked';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
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
        {/* Notifications */}
        {error && (
          <div className="mb-4 p-4 bg-red-500 text-white rounded-lg font-semibold">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-500 text-white rounded-lg font-semibold">
            {success}
          </div>
        )}

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
          <p className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formattedBalance} WC
          </p>
          
          {/* Approve Button */}
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isApproving ? 'Approving...' : 'Approve Vault Contract'}
          </button>
          <p className={`mt-2 text-sm ${isDark ? 'text-purple-300' : 'text-gray-600'}`}>
            Click this once to allow the vault contract to lock your tokens
          </p>
        </div>
        
        {/* Create New Vault */}
        <div className={`rounded-xl px-6 py-8 mb-8 transition-colors duration-300 ${
          isDark 
            ? 'bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-purple-700/50' 
            : 'bg-gradient-to-br from-purple-100 to-blue-100 border border-purple-300 shadow-lg'
        }`}>
          <div className="flex items-center gap-2 mb-6">
            <Lock className={isDark ? 'text-purple-400' : 'text-purple-600'} size={24} />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Create New Vault
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className={`block mb-2 ${isDark ? 'text-purple-200' : 'text-gray-700'}`}>
                Amount (WC)
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className={`w-full border rounded-lg px-4 py-3 ${
                  isDark 
                    ? 'bg-white/10 border-purple-400 text-white placeholder-purple-300' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:border-purple-500`}
              />
            </div>

            <div>
              <label className={`block mb-2 ${isDark ? 'text-purple-200' : 'text-gray-700'}`}>
                Unlock Date & Time
              </label>
              <input
                type="datetime-local"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                className={`w-full border rounded-lg px-4 py-3 ${
                  isDark 
                    ? 'bg-white/10 border-purple-400 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:border-purple-500`}
              />
            </div>

            <button
              onClick={handleCreateVault}
              disabled={isCreating}
              className={`w-full font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 ${
                isDark
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Lock size={20} />
              {isCreating ? 'Creating Vault...' : 'Lock Funds'}
            </button>
          </div>
        </div>

        {/* Vaults List */}
        <VaultsList
          walletAddress={walletAddress}
          vaultIds={vaultIds}
          lockContractConfig={lockContractConfig}
          decimals={decimals}
          currentTime={currentTime}
          getTimeRemaining={getTimeRemaining}
          handleWithdraw={handleWithdraw}
          isWithdrawing={isWithdrawing}
          isDark={isDark}
        />
      </div>
    </div>
  );
}

// Separate component for vaults list
function VaultsList({ 
  walletAddress, 
  vaultIds, 
  lockContractConfig, 
  decimals, 
  currentTime, 
  getTimeRemaining, 
  handleWithdraw, 
  isWithdrawing,
  isDark 
}) {
  if (!vaultIds || vaultIds.length === 0) {
    return (
      <div className={`rounded-2xl p-6 border ${
        isDark ? 'bg-white/10 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          <Clock className={isDark ? 'text-purple-400' : 'text-purple-600'} size={24} />
          Your Vaults
        </h2>
        <div className="text-center py-12">
          <Lock className={`mx-auto mb-4 opacity-50 ${
            isDark ? 'text-purple-400' : 'text-purple-600'
          }`} size={48} />
          <p className={isDark ? 'text-purple-300' : 'text-gray-600'}>
            No vaults created yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-6 border ${
      isDark ? 'bg-white/10 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        <Clock className={isDark ? 'text-purple-400' : 'text-purple-600'} size={24} />
        Your Vaults
      </h2>

      <div className="space-y-4">
        {vaultIds.map((vaultId) => (
          <VaultCard
            key={vaultId.toString()}
            vaultId={vaultId}
            walletAddress={walletAddress}
            lockContractConfig={lockContractConfig}
            decimals={decimals}
            currentTime={currentTime}
            getTimeRemaining={getTimeRemaining}
            handleWithdraw={handleWithdraw}
            isWithdrawing={isWithdrawing}
            isDark={isDark}
          />
        ))}
      </div>
    </div>
  );
}

// Individual vault card component
function VaultCard({ 
  vaultId, 
  walletAddress, 
  lockContractConfig, 
  decimals, 
  currentTime, 
  getTimeRemaining, 
  handleWithdraw, 
  isWithdrawing,
  isDark 
}) {
  const { data: vaultData } = useReadContract({
    ...lockContractConfig,
    functionName: 'getVault',
    args: [walletAddress, vaultId],
    query: {
      enabled: !!walletAddress,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });

  if (!vaultData) return null;

  const [amount, unlockTime, withdrawn, isUnlocked] = vaultData;
  const formattedAmount = decimals ? formatUnits(amount, decimals) : '0';

  return (
    <div className={`border rounded-lg p-4 ${
      withdrawn
        ? 'border-gray-500'
        : isUnlocked
        ? 'border-green-400'
        : isDark ? 'border-purple-400' : 'border-purple-500'
    } ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {withdrawn ? (
            <Unlock className="text-gray-400" size={20} />
          ) : isUnlocked ? (
            <Unlock className="text-green-400" size={20} />
          ) : (
            <Lock className={isDark ? 'text-purple-400' : 'text-purple-600'} size={20} />
          )}
          <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {parseFloat(formattedAmount).toFixed(4)} WC
          </span>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            withdrawn
              ? 'bg-gray-500 text-gray-200'
              : isUnlocked
              ? 'bg-green-500 text-white'
              : 'bg-purple-500 text-white'
          }`}
        >
          {withdrawn ? 'Withdrawn' : getTimeRemaining(unlockTime)}
        </span>
      </div>
      
      <div className={`text-sm mb-3 ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
        <p>Unlocks: {new Date(Number(unlockTime) * 1000).toLocaleString()}</p>
        <p>Vault ID: #{vaultId.toString()}</p>
      </div>

      {!withdrawn && (
        <button
          onClick={() => handleWithdraw(vaultId)}
          disabled={!isUnlocked || isWithdrawing}
          className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
            isUnlocked && !isWithdrawing
              ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          } disabled:opacity-50`}
        >
          {isWithdrawing ? 'Withdrawing...' : isUnlocked ? 'Withdraw' : 'Locked'}
        </button>
      )}
    </div>
  );
}

export default Dashboard;