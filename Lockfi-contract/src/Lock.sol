// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IERC20
 * @dev Interface for ERC20 token standard
 */
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

/**
 * @title TokenTimelockVault
 * @notice Lock ERC20 tokens until a future date
 * @dev Users can create multiple vaults with different unlock times
 */
contract Lock {
    struct Vault {
        address token;          // Address of the ERC20 token
        uint256 amount;         // Amount of tokens locked
        uint256 unlockTime;     // Timestamp when tokens can be withdrawn
        bool withdrawn;         // Whether tokens have been withdrawn
    }
    
    // Mapping: user address => array of their vaults
    mapping(address => Vault[]) public vaults;
    
    // Events for tracking activity
    event VaultCreated(
        address indexed user,
        uint256 indexed vaultId,
        address indexed token,
        uint256 amount,
        uint256 unlockTime
    );
    
    event TokensWithdrawn(
        address indexed user,
        uint256 indexed vaultId,
        address indexed token,
        uint256 amount
    );
    
    /**
     * @notice Create a new vault to lock tokens
     * @param _token Address of the ERC20 token to lock
     * @param _amount Amount of tokens to lock
     * @param _unlockTime Unix timestamp when tokens can be withdrawn
     * @dev User must have approved this contract to spend tokens before calling
     */
    function createVault(
        address _token,
        uint256 _amount,
        uint256 _unlockTime
    ) external {
        require(_token != address(0), "Invalid token address");
        require(_amount > 0, "Amount must be greater than 0");
        require(_unlockTime > block.timestamp, "Unlock time must be in future");
        
        // Transfer tokens from user to this contract
        // User must have called token.approve(vaultAddress, amount) first
        IERC20 token = IERC20(_token);
        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "Token transfer failed"
        );
        
        // Create and store the vault
        uint256 vaultId = vaults[msg.sender].length;
        vaults[msg.sender].push(Vault({
            token: _token,
            amount: _amount,
            unlockTime: _unlockTime,
            withdrawn: false
        }));
        
        emit VaultCreated(msg.sender, vaultId, _token, _amount, _unlockTime);
    }
    
    /**
     * @notice Withdraw tokens from a vault after unlock time
     * @param _index Index of the vault to withdraw from
     */
    function withdraw(uint256 _index) external {
        require(_index < vaults[msg.sender].length, "Vault does not exist");
        
        Vault storage vault = vaults[msg.sender][_index];
        require(!vault.withdrawn, "Already withdrawn");
        require(block.timestamp >= vault.unlockTime, "Still locked");
        
        vault.withdrawn = true;
        
        // Transfer tokens back to user
        IERC20 token = IERC20(vault.token);
        require(
            token.transfer(msg.sender, vault.amount),
            "Token transfer failed"
        );
        
        emit TokensWithdrawn(msg.sender, _index, vault.token, vault.amount);
    }
    
    /**
     * @notice Get the number of vaults for a user
     * @param _user Address of the user
     * @return Number of vaults
     */
    function getVaultCount(address _user) external view returns (uint256) {
        return vaults[_user].length;
    }
    
    /**
     * @notice Get details of a specific vault
     * @param _user Address of the user
     * @param _index Index of the vault
     * @return token Address of the locked token
     * @return amount Amount of tokens locked
     * @return unlockTime When tokens can be withdrawn
     * @return withdrawn Whether tokens have been withdrawn
     */
    function getVault(address _user, uint256 _index)
        external
        view
        returns (
            address token,
            uint256 amount,
            uint256 unlockTime,
            bool withdrawn
        )
    {
        require(_index < vaults[_user].length, "Vault does not exist");
        Vault memory vault = vaults[_user][_index];
        return (vault.token, vault.amount, vault.unlockTime, vault.withdrawn);
    }
    
    /**
     * @notice Get all vaults for a user
     * @param _user Address of the user
     * @return Array of all user's vaults
     */
    function getAllVaults(address _user) external view returns (Vault[] memory) {
        return vaults[_user];
    }
    
    /**
     * @notice Check if a vault is unlocked
     * @param _user Address of the user
     * @param _index Index of the vault
     * @return true if unlocked, false if still locked
     */
    function isUnlocked(address _user, uint256 _index) external view returns (bool) {
        require(_index < vaults[_user].length, "Vault does not exist");
        return block.timestamp >= vaults[_user][_index].unlockTime;
    }
}