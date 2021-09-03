import { expect } from "chai"
import { ethers } from 'hardhat';
import {IUniswapV2Factory} from "@typechains/IUniswapV2Factory";
import utils from "../src/utils";
import configs from "../src/config";
import {WETH_ABI} from "../abis/WETH";
import {routerV2ABI} from "../abis/router";
import ErrnoException = NodeJS.ErrnoException;
const fs = require('fs');

describe("UniSwap Gas Predict", function() {

    let uniFactory: IUniswapV2Factory;
    //let uniRouter: unknown;
    const UNI_FACTORY = configs.TokenConfig.UNISWAP_FACTORY;
    const UNI_ROUTER = configs.TokenConfig.UNISWAP_ROUTER;
    const WETH = configs.TokenConfig.WETH; // WETH 合约地址
    let lpAddress = '0xe3E0d7BcFE5271Ff739414bfBf1d5257fA788bE5';

    fs.readFile('./lpdata/white_eth.txt', function(err:ErrnoException,data:Buffer) {
        if(err) throw err;
        const arr = data.toString().replace(/\r\n/g,'\n').split('\n');
        //let n = 0;
        for(let i of arr) {
            if(i.length != 0)
            {
                let json_obj = JSON.parse(i);
                console.log(json_obj.lp);
            }
            // console.log(n);
            // n = n +1;
        }
    });



    beforeEach(async () => {
        uniFactory = await utils.uniswapTools.getIUniswapFactory(UNI_FACTORY);
    });

    // it("Get LP and show Reserve ", async function() {
    //
    //     console.log("lp address is: ", lpAddress);
    //     let lpContract = await utils.uniswapTools.getIUniswapV2Pair(lpAddress);
    //     let token0 = await lpContract.token0();
    //     let token1 = await lpContract.token1();
    //     let {blockTimestampLast, reserve0, reserve1} = await lpContract.getReserves();
    //     console.log('token 0', token0, reserve0.toString() )
    //     console.log('token 1', token1, reserve1.toString() )
    //     console.log('blockTimestampLast', blockTimestampLast)
    // });

    it("Get LP and test Swap ", async function() {

        const [owner] = await ethers.getSigners();
        console.log("lp address is: ", lpAddress);
        // 0.建立WETH合约实例
        const WETHContract = new ethers.Contract(WETH, WETH_ABI, ethers.provider);
        // 1.先通过utils.uniswapTools.getIUniswapV2Pair(lpAddress)建立lp合约实例lpContract
        let lpContract = await utils.uniswapTools.getIUniswapV2Pair(lpAddress);
        // 2.lpContract.token0()，lpContract.token1()可以得到lp对应的两种token(token1是weth)
        let token0 = await lpContract.token0();
        let token1 = await lpContract.token1();
        // 3.通过lpContract.getReserves()可以得到token0和token1的余额
        let {blockTimestampLast, reserve0, reserve1} = await lpContract.getReserves();
        console.log('\ntoken 0', token0, reserve0.toString() );
        console.log('token 1', token1, reserve1.toString() );
        console.log('blockTimestampLast', blockTimestampLast,"\n");
        // 4.确定buyAmount，计算outAmount，将buyAmount抵押并由WETHContract转到lpAddress账户
        let buyAmount = ethers.utils.parseUnits("1", 18);
        console.log("<buyAmount of WETH =", ethers.utils.formatUnits(buyAmount, 18), ">");
        const uniRouter = await new ethers.Contract(UNI_ROUTER, routerV2ABI, ethers.provider);
        let outAmount = await uniRouter.getAmountOut(buyAmount,reserve1,reserve0);
        console.log("<outAmount of token0 =", ethers.utils.formatUnits(outAmount), ">\n");


        let deposit_trx = await WETHContract.connect(owner).deposit({ value: buyAmount});
        let deposit_res = await deposit_trx.wait();
        //console.log("","deposit gasUsed: "+deposit_res.gasUsed,"");

        let transfer_trx = await WETHContract.connect(owner).transfer(lpAddress, buyAmount);
        let transfer_res = await transfer_trx.wait();
        //console.log("","transfer gasUsed: "+transfer_res.gasUsed,"");
        // 5.调用lp合约的swap函数进行交换
        let swap_trx = await lpContract.connect(owner).swap(outAmount, 0, owner.address, []);
        let swap_res = await swap_trx.wait();
        //console.log("","swap gasUsed: "+swap_res.gasUsed,"");
        // 6.统计gasUsed之和
        let total_gasUsed = Number(deposit_res.gasUsed) + Number(transfer_res.gasUsed) + Number(swap_res.gasUsed);
        console.log("","Total gasUsed: "+total_gasUsed,"");

    });

});