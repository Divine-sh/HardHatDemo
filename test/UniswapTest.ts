import { expect } from "chai"
import { ethers } from 'hardhat';
import {IUniswapV2Factory} from "@typechains/IUniswapV2Factory";
import utils from "../src/utils";
import configs from "../src/config";

describe("UniSwap contract Test", function() {

    let uniFactory: IUniswapV2Factory
    const UNI_FACTORY = configs.TokenConfig.UNISWAP_FACTORY
    const WETH = configs.TokenConfig.WETH
    const USDC = configs.TokenConfig.USDC
    // const {WETH, USDC} = configs.TokenConfig

    beforeEach(async () => {
        const [owner] = await ethers.getSigners();
        uniFactory = await utils.uniswapTools.getIUniswapFactory(UNI_FACTORY)

    });

    it("Get LP and show Reserve ", async function() {
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
});