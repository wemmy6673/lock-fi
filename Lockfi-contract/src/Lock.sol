// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


// A simple time-locked vault contract

contract Lock {
    struct Vault {

        uint256 amount;
        uint256 unlockTime;
        bool withdrawn;
    }
    
    mapping(address => Vault[]) public vaults;
    
    function createVault(uint256 _unlockTime) external payable {
        require(msg.value > 0, "Must send ETH");
        require(_unlockTime > block.timestamp, "Unlock time must be in future");
        
        vaults[msg.sender].push(Vault({
            amount: msg.value,
            unlockTime: _unlockTime,
            withdrawn: false
        }));
    }
    
    function withdraw(uint256 _index) external {
        Vault storage vault = vaults[msg.sender][_index];
        require(!vault.withdrawn, "Already withdrawn");
        require(block.timestamp >= vault.unlockTime, "Still locked");
        
        vault.withdrawn = true;
        payable(msg.sender).transfer(vault.amount);
    }
}