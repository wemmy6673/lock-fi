import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import Landing from './pages/Landing.jsx';



const queryClient = new QueryClient();
const App = () => {
  
const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: '9786028962cecdd7167d7eb4bc1649c0',
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {/* Your App */}
          <Landing />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};export default App;