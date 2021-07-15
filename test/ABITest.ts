import { expect } from "chai"
import { ethers } from 'hardhat';
import {IUniswapV2Factory} from "@typechains/IUniswapV2Factory";
import utils from "../src/utils";
import configs from "../src/config";
import {UNIFACTORY_ABI} from "../abis/uniswap";
import {config} from "dotenv";
import {BPOOL_ABI} from "../abis/bpool";
import ABICONFIG from "../abis";

describe("UniSwap contract Test", function() {
    const UNI_FACTORY = configs.TokenConfig.UNISWAP_FACTORY
    const WETH = configs.TokenConfig.WETH
    const USDC = configs.TokenConfig.USDC
    // const {WETH, USDC} = configs.TokenConfig
    beforeEach(async () => {

    });

    it("UniSwap LP and show Reserve ", async function() {
        let uniFactory = new ethers.Contract(configs.TokenConfig.UNISWAP_FACTORY, ABICONFIG.UNIFACTORY_ABI,ethers.provider)
        let lpAddress = await uniFactory.getPair(WETH, USDC)
        console.log("lp address is ", lpAddress)
        let lpContract = await utils.uniswapTools.getIUniswapV2Pair(lpAddress)
        let token0 = await lpContract.token0()
        let token1 = await lpContract.token1()
        let {blockTimestampLast, reserve0, reserve1} = await lpContract.getReserves();
        console.log('token 0', token0, reserve0.toString() )
        console.log('token 1', token1, reserve1.toString() )
        console.log('blockTimestampLast', blockTimestampLast)
    });

    it("Bpool Balance OF ", async function() {
        let BPoolAddress = "0x59A19D8c652FA0284f44113D0ff9aBa70bd46fB4"
        let bPool = new ethers.Contract(BPoolAddress, ABICONFIG.BPOOL_ABI, ethers.provider)
        let wallet = ethers.Wallet.createRandom()
        let balance = await bPool.balanceOf(wallet.address)
        console.log("balance is ", balance.toString())
    });




});