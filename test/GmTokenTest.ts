import { ethers ,waffle } from 'hardhat';
import {GM, StorageDemo} from "../typechain";
import {expect} from "chai";
import assert from "assert";
import {BigNumber} from "ethers";
import common from "mocha/lib/interfaces/common";
import ABICONFIG from "../abis";
import {lpv2ABI} from "../abis/lpv2";
import configs from "../src/config";

describe("Gm Token contract", function() {
    let gmContract: GM;
    //let charityWalletAddress = '0xBC7250C8c3eCA1DfC1728620aF835FCa489bFdf3';

    // 这个函数是每个it Case 都会重新调用
    beforeEach(async () => {
        const [owner] = await ethers.getSigners();
        let charityWalletAddress = owner.address;
        const contractFactory = await ethers.getContractFactory("GM");

        {
            let block = await ethers.provider.getBlock('latest')
            console.log('blockNumber', block.number)
        }

        gmContract = await contractFactory.deploy(charityWalletAddress) as GM;

        {
            let block = await ethers.provider.getBlock('latest')
            console.log('blockNumber', block.number)
        }

        console.log("Init Contract")
    });

    it("Deployment should assign the total supply of tokens to the owner", async function() {
        const [owner] = await ethers.getSigners();
        console.log(owner.address);
        const ownerBalance = await gmContract.balanceOf(owner.address);
        console.log(ownerBalance.toString());
        const signers = await ethers.getSigners();
        console.log('length:', signers.length)
        for (let i = 0; i < signers.length; i++) {
            console.log(signers[i].address);
            let Balance = await gmContract.balanceOf(signers[i].address);
            console.log(Balance.toString());
            console.log('*****************************');
        }
    });

    // it("Allowance", async function() {
    //     const [owner] = await ethers.getSigners();
    //     console.log(owner.address)
    //     const ownerBalance = await gmContract.balanceOf(owner.address);
    //     console.log(ownerBalance.toString())
    //
    // });

    it("Transfer test", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const myAddress = '0xd0412FdB6fdFb6237d7BD5DB61aBA0a2897295d4'
        const yourAddress = '0xf5ea1800f7f9145e1e6d31e61fa5b6874feccb93'

        //使用transferFrom必须有allowance，如果转账金额大于allowance，转账会失败
        // const increase = await gmContract.increaseAllowance(myAddress, 100)
        // const allowance_om = await gmContract.allowance(owner.address, myAddress);
        // console.log(allowance_om.toString());
        // const allowance_mm = await gmContract.allowance(myAddress, myAddress);
        // console.log(allowance_mm.toString());
        // const transfer = await gmContract.transferFrom(owner.address, myAddress,44); console.log('msg.sender:',transfer);
        // const myBalance = await gmContract.balanceOf(myAddress);
        // console.log(myBalance.toString());
        // const ownerBalance = await gmContract.balanceOf(owner.address);
        // console.log(ownerBalance.toString());

        // 使用transfer
        // const transfer1 = await gmContract.transfer(myAddress,100);
        // const transfer2 = await gmContract.transfer(yourAddress,50);
        // const ownerBalance = await gmContract.balanceOf(owner.address);
        // console.log('ownerBalance:', ownerBalance.toString());
        // const myBalance = await gmContract.balanceOf(myAddress);
        // console.log('myBalance:', myBalance.toString());
        // const yourBalance = await gmContract.balanceOf(yourAddress);
        // console.log('yourBalance:', yourBalance.toString());


        // const UNI_FACTORY = configs.TokenConfig.UNISWAP_FACTORY
        // const UNISWAP_ROUTER = configs.TokenConfig.UNISWAP_ROUTER
        // const WETH = configs.TokenConfig.WETH
        // const USDC = configs.TokenConfig.USDC
        // const GM = configs.TokenConfig.GM
        //
        // let uniFactory = new ethers.Contract(UNI_FACTORY, ABICONFIG.UNIFACTORY_ABI, ethers.provider)
        // let lpAddress = await uniFactory.getPair(WETH, GM)
        // console.log("lp address is ", lpAddress)
        // let lpContract = new ethers.Contract(lpAddress, lpv2ABI, ethers.provider)
        // let token0 = await lpContract.token0()
        // let token1 = await lpContract.token1()
        // let [reserve0, reserve1, blockTimestampLast] = await lpContract.getReserves();
        // console.log('token 0', token0, reserve0.toString() )
        // console.log('token 1', token1, reserve1.toString() )
        // console.log('blockTimestampLast', blockTimestampLast)
        //
        // //交易前owner的余额
        // const balance01 = await gmContract.connect(owner).balanceOf(owner.address);
        // //交易前lp的余额
        // const balance11 = await gmContract.connect(owner).balanceOf(lpAddress);
        // console.log(balance01.toString(), balance11.toString());
        //
        // const transfer3 = await gmContract.connect(owner).transfer(lpAddress, 1000);
        //
        // //交易后owner的余额
        // const balance02 = await gmContract.connect(owner).balanceOf(owner.address);
        // //交易后lp的余额
        // const balance12 = await gmContract.connect(owner).balanceOf(lpAddress);
        // console.log(balance02.toString(), balance12.toString());

        //从deployer转账到addr1
        const trx0 = await gmContract.connect(owner).transfer(addr1.address, 484623);
        //交易前addr1的余额
        const balance01 = await gmContract.connect(owner).balanceOf(addr1.address);
        //交易前addr2的余额
        const balance02 = await gmContract.connect(owner).balanceOf(addr2.address);
        console.log(balance01.toString(), balance02.toString());

        const trx1 = await gmContract.connect(addr1).transfer(addr2.address, 1000);

        //交易后addr1的余额
        const balance11 = await gmContract.connect(owner).balanceOf(addr1.address);
        //交易后addr2的余额
        const balance22 = await gmContract.connect(owner).balanceOf(addr2.address);
        console.log(balance11.toString(), balance22.toString());

    });

});