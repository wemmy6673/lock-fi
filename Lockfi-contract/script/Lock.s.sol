// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {Lock} from "../src/Lock.sol";

contract LockScript is Script {

    function run() external {

        Lock lock;

        vm.startBroadcast();
         lock = new Lock();
        vm.stopBroadcast();
    }
}