// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import 'hardhat/console.sol';

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
contract StorageDemo {
    uint256 number;

    /**
    * @dev Set contract deployer as owner
    */
    constructor(uint256 _number) {
    number = _number;

    }
    event NumberLog(uint256 idx, uint256 value);
    /**
     * @dev Store value in variable
     * @param num value to store
     */
    function store(uint256 num) public {
        console.log('gas left',gasleft());
        number = num;
        emit NumberLog(0, number);
        console.log('gas left',gasleft());
    }

    /**
     * @dev Return value
     * @return value of 'number'
     */
    function retrieve() public view returns (uint256){
        return number;
    }
}