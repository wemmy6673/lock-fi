// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {WildCoin} from "../src/WildCoin.sol";

contract DeployWildCoin is Script {
    function run() external returns (WildCoin) {
        // Get the deployer's private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying WildCoin with account:", deployer);
        console.log("Account balance:", deployer.balance);
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the WildCoin contract
        // The deployer will be set as the initial owner
        WildCoin wildCoin = new WildCoin(deployer);
        
        console.log("WildCoin deployed to:", address(wildCoin));
        console.log("Owner:", wildCoin.owner());
        console.log("Name:", wildCoin.name());
        console.log("Symbol:", wildCoin.symbol());
        console.log("Decimals:", wildCoin.decimals());
        
        vm.stopBroadcast();
        
        return wildCoin;
    }
}