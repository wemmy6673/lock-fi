// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {Lock} from "../src/Lock.sol";

contract LockScript is Script {

    function run() external {

        address _tokenAddress = 0x9F6fc2403352748E35b7c55fF1b7E2D46927A326;
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        Lock lock;

        vm.startBroadcast(deployerPrivateKey);
         lock = new Lock(_tokenAddress);
        vm.stopBroadcast();
    }
}