# Lock-fi 🔒

A decentralized token locking protocol built on Celo that allows users to create time-locked vaults for their ERC-20 tokens.

## Overview

Lock-fi enables users to lock their tokens for a specified period. Each user can create multiple independent vaults with custom unlock times, ensuring tokens remain inaccessible until the predetermined date arrives.

## Key Features

- **Multiple Vaults**: Creating unlimited time-locked vaults with different amounts and unlock times
- **Non-custodial**: Tokens are secured by smart contracts, not centralized entities
- **Flexible Timeframes**: Locking tokens for any duration - days, weeks, months, or years
- **Real-time Tracking**: Live countdown timers show exactly when your tokens unlock
- **Instant Withdrawals**: Withdrawing immediately once the unlock time is reached
- **User-friendly Interface**: Clean, dark-themed dashboard with intuitive controls

## How It Works

1. **Approve**: Grant the vault contract permission to lock your tokens (one-time action)
2. **Create Vault**: Specify the amount and unlock date/time for your tokens
3. **Wait**: Your tokens are securely locked in the smart contract
4. **Withdraw**: Once the unlock time arrives, withdraw your tokens with one click

## Technical Stack

- **Smart Contracts**: Solidity with OpenZeppelin standards
- **Frontend**: React + Viem + Wagmi
- **Blockchain**: Celo Sepolia Testnet
- **Wallet Integration**: RainbowKit


## Smart Contracts

- **WC Token**: `0x9F6fc2403352748E35b7c55fF1b7E2D46927A326`
- **TokenVault**: `0x2941dd5F8d21ED72902A58325d2C8A083b0DDf9F`

## Security

Built with battle-tested OpenZeppelin contracts including ReentrancyGuard for maximum security. All vaults are immutable once created - not even the contract owner can access locked tokens before the unlock time.

---

Built by **Wemi** & **Claude** 🚀