import { expect } from "chai"
import { ethers ,waffle} from 'hardhat';
import {StorageDemo} from "../typechain";
import assert from "assert";
import {BigNumber} from "ethers";

describe("Storage Demo contract", function() {
    let storageContract:StorageDemo;
    let initNumber = 100
    // 这个函数是每个it Case 都会重新调用
    beforeEach(async () => {
        const contractFactory = await ethers.getContractFactory("StorageDemo");

        {
            let block = await ethers.provider.getBlock('latest')
            console.log('blockNumber', block.number)
        }

        storageContract = await contractFactory.deploy(initNumber) as StorageDemo;

        {
            let block = await ethers.provider.getBlock('latest')
            console.log('blockNumber', block.number)
        }

        console.log("Init Contract")
    });

    // it("retrieve test", async function() {
    //     let retrieveValue = await storageContract.retrieve()
    //     // 合约上返回的数据模式是 BigNumber, 需要经过转化之后才能使用
    //     console.log(retrieveValue, retrieveValue.toString());
    //     assert (
    //         retrieveValue.eq(BigNumber.from(initNumber))
    //     );
    // });
    //
    // it("set test more than 300", async function() {
    //     // 更改合约状态
    //     let newValue = 5000;
    //     let [signer] = await ethers.getSigners()
    //
    //     let trx = await storageContract.store(newValue)
    //     let res = await trx.wait()
    //     console.log('trx res', res, res.gasUsed.toString())
    //     console.log('from' , res.from, signer.address)
    //
    //     let retrieveValue = await storageContract.retrieve()
    //
    //     // 合约上返回的数据模式是 BigNumber, 需要经过转化之后才能使用
    //     console.log(retrieveValue, retrieveValue.toString())
    //     expect(retrieveValue).eq(newValue)
    // });

    it("populateTransaction storage", async function() {
        // 更改合约状态
        let newValue = 500;
        const [signer] = waffle.provider.getWallets();
        let block = await ethers.provider.getBlock('latest')

        let trx = await storageContract.connect(signer).populateTransaction.store(newValue, {
            gasPrice: block.baseFeePerGas!,
            gasLimit: 50000
        })
        trx['nonce'] = await ethers.provider.getTransactionCount(signer.address);
        console.log('trx', trx)
        let signedTrx = await signer.signTransaction(trx)
        console.log('signedTrx', signedTrx, ethers.utils.keccak256(signedTrx))

        let sendTrx = await ethers.provider.sendTransaction(signedTrx);
        console.log('txHas', sendTrx.hash)
        // let res = await sendTrx.wait()
        // console.log('trx res', res, res.gasUsed.toString())
        // console.log('from' , res.from, signer.address, signer.address)

        let retrieveValue = await storageContract.retrieve()

        // 合约上返回的数据模式是 BigNumber, 需要经过转化之后才能使用
        console.log(retrieveValue, retrieveValue.toString())
        // expect(retrieveValue).eq(newValue)
        // 0x0a43eced0310f94605907e12f58d25bda00a8ef459539162178c505d256d2c07
    });


});