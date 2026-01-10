// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TokenVault is ReentrancyGuard {
    struct Vault {
        uint256 amount;
        uint256 unlockTime;
        bool withdrawn;
    }

    // Token to be locked
    IERC20 public token;
    
    // Mapping from user address to their vault IDs to vault data
    mapping(address => mapping(uint256 => Vault)) public vaults;
    
    // Mapping from user address to their vault count
    mapping(address => uint256) public vaultCount;
    
    // Events
    event VaultCreated(address indexed user, uint256 vaultId, uint256 amount, uint256 unlockTime);
    event TokensWithdrawn(address indexed user, uint256 vaultId, uint256 amount);
    
    constructor(address _tokenAddress) {
        require(_tokenAddress != address(0), "Invalid token address");
        token = IERC20(_tokenAddress);
    }
    
    /**
     * @dev Create a new vault by locking tokens
     * @param amount Amount of tokens to lock
     * @param unlockTime Unix timestamp when tokens can be withdrawn
     */
    function createVault(uint256 amount, uint256 unlockTime) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(unlockTime > block.timestamp, "Unlock time must be in the future");
        
        // Transfer tokens from user to contract
        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        
        // Get the next vault ID for this user
        uint256 vaultId = vaultCount[msg.sender];
        
        // Create the vault
        vaults[msg.sender][vaultId] = Vault({
            amount: amount,
            unlockTime: unlockTime,
            withdrawn: false
        });
        
        // Increment vault count
        vaultCount[msg.sender]++;
        
        emit VaultCreated(msg.sender, vaultId, amount, unlockTime);
    }
    
    /**
     * @dev Withdraw tokens from a vault
     * @param vaultId The ID of the vault to withdraw from
     */
    function withdraw(uint256 vaultId) external nonReentrant {
        require(vaultId < vaultCount[msg.sender], "Vault does not exist");
        
        Vault storage vault = vaults[msg.sender][vaultId];
        
        require(!vault.withdrawn, "Tokens already withdrawn");
        require(block.timestamp >= vault.unlockTime, "Tokens are still locked");
        require(vault.amount > 0, "No tokens to withdraw");
        
        uint256 amount = vault.amount;
        
        // Mark as withdrawn
        vault.withdrawn = true;
        
        // Transfer tokens back to user
        require(token.transfer(msg.sender, amount), "Token transfer failed");
        
        emit TokensWithdrawn(msg.sender, vaultId, amount);
    }
    
    /**
     * @dev Get vault details
     * @param user User address
     * @param vaultId Vault ID
     */
    function getVault(address user, uint256 vaultId) external view returns (
        uint256 amount,
        uint256 unlockTime,
        bool withdrawn,
        bool isUnlocked
    ) {
        require(vaultId < vaultCount[user], "Vault does not exist");
        
        Vault memory vault = vaults[user][vaultId];
        
        return (
            vault.amount,
            vault.unlockTime,
            vault.withdrawn,
            block.timestamp >= vault.unlockTime
        );
    }
    
    /**
     * @dev Get all vault IDs for a user
     * @param user User address
     */
    function getUserVaults(address user) external view returns (uint256[] memory) {
        uint256 count = vaultCount[user];
        uint256[] memory vaultIds = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            vaultIds[i] = i;
        }
        
        return vaultIds;
    }
    
    /**
     * @dev Get total locked balance for a user (excluding withdrawn vaults)
     * @param user User address
     */
    function getTotalLocked(address user) external view returns (uint256) {
        uint256 total = 0;
        uint256 count = vaultCount[user];
        
        for (uint256 i = 0; i < count; i++) {
            if (!vaults[user][i].withdrawn) {
                total += vaults[user][i].amount;
            }
        }
        
        return total;
    }
}