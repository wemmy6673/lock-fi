import { Lock } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Landing Page Component
function Landing() {
  return (
    <div className="min-h-screen bg-black">
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo Icon */}
        <div className="mb-4 p-8 rounded-full bg-green-600">
          <Lock size={40} className="text-white" />
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-5xl font-bold mb-6 text-white">
          Lock-fi
        </h1>

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
                        className="px-8 py-3 text-lg font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/50 transition-all duration-300"
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

        <p className="mt-8 text-sm text-gray-400">
          Connect your wallet to access dashboard.
        </p>
      </div>
    </div>
  );
}

export default Landing;