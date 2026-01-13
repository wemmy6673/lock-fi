import { useState } from 'react';
import LandingPage from './pages/Landing.jsx';
import DashboardPage from './pages/Dashboard.jsx';
import { useAccount } from 'wagmi';


export default function App() {
  const { isConnected } = useAccount();
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Render appropriate page based on connection status
  if (!isConnected) {
    return (
      <LandingPage 
        isDark={isDark}
        toggleTheme={toggleTheme}
      />
    );
  }

  return (
    <DashboardPage 
      
    />
  );
}