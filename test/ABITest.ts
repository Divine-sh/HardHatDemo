import { expect } from "chai"
import { ethers } from 'hardhat';
import {IUniswapV2Factory} from "@typechains/IUniswapV2Factory";
import utils from "../src/utils";
import configs from "../src/config";
import {UNIFACTORY_ABI} from "../abis/uniswap";
import {config} from "dotenv";
import {BPOOL_ABI} from "../abis/bpool";
import ABICONFIG from "../abis";
import {lpv2ABI} from "../abis/lpv2";
import { routerV2ABI} from "../abis/router";
import {it} from "mocha";

describe("UniSwap contract Test", function() {
    const UNI_FACTORY = configs.TokenConfig.UNISWAP_FACTORY
    const UNISWAP_ROUTER = configs.TokenConfig.UNISWAP_ROUTER
    const WETH = configs.TokenConfig.WETH
    const USDC = configs.TokenConfig.USDC
    // const {WETH, USDC} = configs.TokenConfig
    beforeEach(async () => {

    });

    it("UniSwap getAmountOut", async function() {
        // 创建工厂合约实例
        // UniswapV2Factory is deployed at 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f on the Ethereum mainnet
        let uniFactory = new ethers.Contract(UNI_FACTORY, ABICONFIG.UNIFACTORY_ABI, ethers.provider)
        //获取lp地址
        let lpAddress = await uniFactory.getPair(WETH, USDC)
        console.log("lp address is ", lpAddress)

        let lpContract = new ethers.Contract(lpAddress, lpv2ABI, ethers.provider)

        let token0 = await lpContract.token0()
        let token1 = await lpContract.token1()
        let [reserve0, reserve1, blockTimestampLast] = await lpContract.getReserves();

        console.log('token 0', token0, reserve0.toString() )
        console.log('token 1', token1, reserve1.toString() )
        console.log('blockTimestampLast', blockTimestampLast)

        // UniswapV2Router02 is deployed at 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D on the Ethereum mainnet
        let routerContract = new ethers.Contract(UNISWAP_ROUTER, routerV2ABI, ethers.provider)
        // 1000u
        let buyAmount = ethers.utils.parseUnits('1000', 6)
        console.log('buyAmount', buyAmount)
        let outAmount = await routerContract.getAmountOut(buyAmount, reserve0, reserve1)
        console.log('output amount', outAmount, ethers.utils.formatUnits(outAmount, 18))
    });

    it("UniSwap getAmountIn", async function(){
        // 创建工厂合约实例
        // UniswapV2Factory is deployed at 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f on the Ethereum mainnet
        let uniFactory = new ethers.Contract(UNI_FACTORY, ABICONFIG.UNIFACTORY_ABI, ethers.provider)
        //获取lp地址
        let lpAddress = await uniFactory.getPair(WETH, USDC)
        console.log("lp address is ", lpAddress)
        // 创建lp合约实例
        let lpContract = new ethers.Contract(lpAddress, lpv2ABI, ethers.provider)

        let token0 = await lpContract.token0()
        let token1 = await lpContract.token1()
        let [reserve0, reserve1, blockTimestampLast] = await lpContract.getReserves();

        console.log('token 0', token0, reserve0.toString() )
        console.log('token 1', token1, reserve1.toString() )
        console.log('blockTimestampLast', blockTimestampLast)

        // UniswapV2Router02 is deployed at 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D on the Ethereum mainnet
        let routerContract = new ethers.Contract(UNISWAP_ROUTER, routerV2ABI, ethers.provider)
        //1000u
        let outAmount = ethers.utils.parseUnits('0.33', 18)
        console.log('outAmount', outAmount)
        let needAmount = await routerContract.getAmountIn(outAmount, reserve0, reserve1)
        console.log('need amount', needAmount, ethers.utils.formatUnits(needAmount, 6))

    });
    // it("Bpool Balance OF ", async function() {
    //     let BPoolAddress = "0x59A19D8c652FA0284f44113D0ff9aBa70bd46fB4"
    //     let bPool = new ethers.Contract(BPoolAddress, ABICONFIG.BPOOL_ABI, ethers.provider)
    //     let wallet = ethers.Wallet.createRandom()
    //     let balance = await bPool.balanceOf(wallet.address)
    //     console.log("balance is ", balance.toString())
    // });
});