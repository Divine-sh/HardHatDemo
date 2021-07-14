import { expect } from "chai"
import { ethers } from 'hardhat';
import {StorageDemo} from "../typechain";

describe("Storage Demo contract", function() {
    let storageContract:StorageDemo;
    let initNumber = 100
    // 这个函数是每个it Case 都会重新调用
    beforeEach(async () => {
        const [owner] = await ethers.getSigners();
        const contractFactory = await ethers.getContractFactory("StorageDemo");
        storageContract = await contractFactory.deploy(initNumber) as StorageDemo;
        console.log("Init Contract")
    });
    it("retrieve test", async function() {
        let retrieveValue = await storageContract.retrieve()
        // 合约上返回的数据模式是 BigNumber, 需要经过转化之后才能使用
        console.log(retrieveValue, retrieveValue.toString())
        expect(retrieveValue).eq(initNumber)
    });

    it("set test more than 300", async function() {
        // 更改合约状态
        let newValue = 5000;
        await storageContract.store(newValue)

        let retrieveValue = await storageContract.retrieve()

        // 合约上返回的数据模式是 BigNumber, 需要经过转化之后才能使用
        console.log(retrieveValue, retrieveValue.toString())
        expect(retrieveValue).eq(newValue)
    });

});