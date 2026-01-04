// contracts.ts
export const wagmiContractConfig = {
  address: '0x9F6fc2403352748E35b7c55fF1b7E2D46927A326', // ← MUST be your contract address on Celo Alfajores
  abi: [
    {
      "constant": true,
      "inputs": [{"name": "account", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "", "type": "uint256"}],
      "type": "function"
    },
    // ... other functions if needed
  ] as const,
} as const;