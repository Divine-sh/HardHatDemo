import { expect } from "chai"
import { ethers } from 'hardhat';
import {IUniswapV2Factory} from "@typechains/IUniswapV2Factory";
import utils from "../src/utils";
import configs from "../src/config";
import {WETH_ABI} from "../abis/WETH";

describe("UniSwap contract Test", function() {

    let uniFactory: IUniswapV2Factory;
    const UNI_FACTORY = configs.TokenConfig.UNISWAP_FACTORY;
    const WETH = configs.TokenConfig.WETH; // WETH 合约地址
    let lpAddress = '0xe3E0d7BcFE5271Ff739414bfBf1d5257fA788bE5';

    beforeEach(async () => {
        const [owner] = await ethers.getSigners();
        uniFactory = await utils.uniswapTools.getIUniswapFactory(UNI_FACTORY);
    });

    it("Get LP and show Reserve ", async function() {

        console.log("lp address is: ", lpAddress);
        let lpContract = await utils.uniswapTools.getIUniswapV2Pair(lpAddress);
        let token0 = await lpContract.token0();
        let token1 = await lpContract.token1();
        let {blockTimestampLast, reserve0, reserve1} = await lpContract.getReserves();
        console.log('token 0', token0, reserve0.toString() )
        console.log('token 1', token1, reserve1.toString() )
        console.log('blockTimestampLast', blockTimestampLast)
    });

    it("Get LP and test Swap ", async function() {

        console.log("lp address is: ", lpAddress);
        // 0.建立WETH合约实例
        const WETHContract = new ethers.Contract(WETH, WETH_ABI, ethers.provider)
        // 1.先通过utils.uniswapTools.getIUniswapV2Pair(lpAddress)建立lp合约实例lpContract
        let lpContract = await utils.uniswapTools.getIUniswapV2Pair(lpAddress);
        // 2.lpContract.token0()，lpContract.token1()可以得到lp对应的两种token(token1是weth)
        let token0 = await lpContract.token0();
        let token1 = await lpContract.token1();
        // 3.通过lpContract.getReserves()可以得到token0和token1的余额
        let {blockTimestampLast, reserve0, reserve1} = await lpContract.getReserves();
        console.log('token 0', token0, reserve0.toString() )
        console.log('token 1', token1, reserve1.toString() )
        console.log('blockTimestampLast', blockTimestampLast)
        // 4.将buyAmount抵押并由WETHContract转到lpAddress账户

        // 5.调用lp合约的swap函数进行交换

        // 6.统计gasUsed之和



    });

});