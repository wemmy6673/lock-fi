import { useAccount, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';
import { Lock, Clock, Coins, Unlock } from 'lucide-react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { wagmiContractConfig } from '../../contract';
import { lockContractConfig } from '../../lock';

function Dashboard() {
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
      refetchInterval: false, // Disable auto-refetch to prevent input issues
    },
  });

  // Get user's vault IDs
  const { data: vaultIdsRaw, refetch: refetchVaultIds } = useReadContract({
    ...lockContractConfig,
    functionName: 'getUserVaults',
    args: [walletAddress],
    query: {
      enabled: !!walletAddress,
      refetchInterval: false, // Disable auto-refetch to prevent input issues
    },
  });

  // Convert BigInt array to regular numbers to avoid serialization issues
  const vaultIds = vaultIdsRaw ? vaultIdsRaw.map(id => Number(id)) : [];

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
      const amountToApprove = parseUnits('1000000', decimals || 18);
      
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950">
        <div className="lg:w-3/4 mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-600">
              <Lock size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white hidden md:flex">Lock-fi</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-lg bg-gray-900 text-green-400 font-mono text-sm border border-gray-800">
              {truncateAddress(walletAddress)}
            </div>

            <button
              onClick={() => disconnect()}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
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
          <div className="mb-4 p-4 bg-red-600 text-white rounded-lg font-semibold">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-600 text-white rounded-lg font-semibold">
            {success}
          </div>
        )}

        {/* Balance Card */}
        <div className="rounded-xl px-6 py-16 mb-8 bg-black">
          <div className="flex items-center gap-3 mb-2">
            <Coins size={24} className="text-green-400" />
            <h3 className="text-lg font-semibold text-gray-300">
              Available Balance
            </h3>
          </div>
          <p className="text-4xl font-bold mb-4 text-white">
            {formattedBalance} WC
          </p>
          
          {/* Approve Button */}
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="px-6 py-2 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApproving ? 'Approving...' : 'Approve Vault Contract'}
          </button>
          <p className="mt-2 text-sm text-gray-400">
            Click this once to allow the vault contract to lock your wildcoin tokens
          </p>
        </div>
        
        {/* Create New Vault */}
        <div className="rounded-xl px-6 py-8 mb-8 bg-gray-950 border border-gray-800">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="text-green-400" size={24} />
            <h2 className="text-lg font-semibold text-gray-300">
              Create New Vault
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-gray-400">Amount (WC)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                autoComplete="off"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                style={{
                  colorScheme: 'dark'
                }}
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-400">Unlock Date & Time</label>
              <input
                type="datetime-local"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                autoComplete="off"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                style={{
                  colorScheme: 'dark'
                }}
              />
            </div>

            <button
              onClick={handleCreateVault}
              disabled={isCreating}
              className="w-full font-bold py-3 px-6 rounded-lg bg-green-600 hover:bg-green-700 text-white transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
        />


      
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-950 mt-16">
        <div className="lg:w-3/4 mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Lock size={18} className="text-green-400" />
              <span className="text-gray-400 text-sm">
                Built by <span className="text-green-400 font-semibold">Wemi</span> & <span className="text-green-400 font-semibold">Claude</span>
              </span>
            </div>
            <div className="text-gray-500 text-sm">
              © 2026 Lock-fi. Secure your tokens on-chain.
            </div>
          </div>
        </div>
      </footer>
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
  isWithdrawing
}) {
  if (!vaultIds || vaultIds.length === 0) {
    return (
      <div className="rounded-2xl p-6 bg-gray-950 border border-gray-800">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
          <Clock className="text-green-400" size={24} />
          Your Vaults
        </h2>
        <div className="text-center py-12">
          <Lock className="mx-auto mb-4 text-green-400 opacity-50" size={48} />
          <p className="text-gray-400">No vaults created yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 bg-gray-950 border border-gray-800">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
        <Clock className="text-green-400" size={24} />
        Your Vaults
      </h2>

      <div className="space-y-4">
        {vaultIds.map((vaultId) => (
          <VaultCard
            key={vaultId}
            vaultId={vaultId}
            walletAddress={walletAddress}
            lockContractConfig={lockContractConfig}
            decimals={decimals}
            currentTime={currentTime}
            getTimeRemaining={getTimeRemaining}
            handleWithdraw={handleWithdraw}
            isWithdrawing={isWithdrawing}
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
  isWithdrawing
}) {
  const { data: vaultData } = useReadContract({
    ...lockContractConfig,
    functionName: 'getVault',
    args: [walletAddress, BigInt(vaultId)],
    query: {
      enabled: !!walletAddress,
      refetchInterval: 5000,
    },
  });

  if (!vaultData) return null;

  const [amount, unlockTime, withdrawn, isUnlocked] = vaultData;
  const formattedAmount = decimals ? formatUnits(amount, decimals) : '0';

  return (
    <div className={`border rounded-lg p-4 bg-gray-900 ${
      withdrawn
        ? 'border-gray-700'
        : isUnlocked
        ? 'border-green-500'
        : 'border-gray-800'
    }`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {withdrawn ? (
            <Unlock className="text-gray-500" size={20} />
          ) : isUnlocked ? (
            <Unlock className="text-green-400" size={20} />
          ) : (
            <Lock className="text-green-400" size={20} />
          )}
          <span className="font-bold text-xl text-white">
            {parseFloat(formattedAmount).toFixed(4)} WC
          </span>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            withdrawn
              ? 'bg-gray-700 text-gray-400'
              : isUnlocked
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-gray-300'
          }`}
        >
          {withdrawn ? 'Withdrawn' : getTimeRemaining(unlockTime)}
        </span>
      </div>
      
      <div className="text-sm mb-3 text-gray-400">
        <p>Unlocks: {new Date(Number(unlockTime) * 1000).toLocaleString()}</p>
        <p>Vault ID: #{vaultId}</p>
      </div>

      {!withdrawn && (
        <button
          onClick={() => handleWithdraw(vaultId)}
          disabled={!isUnlocked || isWithdrawing}
          className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
            isUnlocked && !isWithdrawing
              ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          } disabled:opacity-50`}
        >
          {isWithdrawing ? 'Withdrawing...' : isUnlocked ? 'Withdraw' : 'Locked'}
        </button>
      )}
    </div>
  );
}

export default Dashboard;