import { expect } from "chai"
import { ethers } from 'hardhat';
import {IUniswapV2Factory} from "@typechains/IUniswapV2Factory";
import utils from "../src/utils";
import configs from "../src/config";
import {WETH_ABI} from "../abis/WETH";
import {routerV2ABI} from "../abis/router";
import ErrnoException = NodeJS.ErrnoException;
import {copyFileSync} from "fs";
import {log} from "util";
const fs = require('fs');
type libUnit = {
    lpAdd: string,
    deposGas: number, //抵押eth的gas
    transGas: number, //传送token到lp的gas
    swapGas: number, //在lp上交换的gas
    totalGas: number, //传送加交换的gas
    default: string
}
describe("UniSwap Gas Predict", function() {

    const inputPath:string = './lpdata/white_eth.txt';
    const outputPath:string = './lpdata/lp_eth_gas_info.json';
    let uniFactory: IUniswapV2Factory;
    //let uniRouter: unknown;
    const UNI_FACTORY = configs.TokenConfig.UNISWAP_FACTORY;
    const UNI_ROUTER = configs.TokenConfig.UNISWAP_ROUTER;
    const WETH = configs.TokenConfig.WETH; // WETH 合约地址
    let lpAddress:string;

    let lpAdds: string[] = [];
    let totalGas: number[] = [];
    let lib: libUnit[] = [];

    fs.readFile(inputPath, function(err:ErrnoException,data:Buffer) {
        if(err) throw err;
        const arr = data.toString().replace(/\r\n/g,'\n').split('\n');
        let n = 0;
        for(let i of arr) {
            n++;
            if(i.length != 0)
            {
                let json_obj = JSON.parse(i);
                //console.log(n,": ",json_obj.lp);
                lpAdds.push(json_obj.lp);
                //console.log(n,": ",json_obj.lp);
            }
        }
        //console.log(lpAdds.length);
    });



    beforeEach(async () => {
        //console.log(lpAdds.length);
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
    //console.log(lpAdds.length); //输出0

    it("Get LP and test Swap ", async function() {
        this.timeout(0);
        const [owner] = await ethers.getSigners();
        // 0.建立WETH合约实例
        const WETHContract = new ethers.Contract(WETH, WETH_ABI, ethers.provider);
        for (let i = 0; i < lpAdds.length; i++)
        {
            lpAddress = lpAdds[i];
            //lpAddress = '0xd535dbf27942551A98Cd0723552BDAf70628DbF8';
            console.log(i,":lp address is: ", lpAddress);

            // 1.先通过utils.uniswapTools.getIUniswapV2Pair(lpAddress)建立lp合约实例lpContract
            let lpContract = await utils.uniswapTools.getIUniswapV2Pair(lpAddress);

            // 2.lpContract.token0()，lpContract.token1()可以得到lp对应的两种token
            let token0 = await lpContract.token0(); let token1 = await lpContract.token1();

            // 3.通过lpContract.getReserves()可以得到token0和token1的余额
            let {blockTimestampLast, reserve0, reserve1} = await lpContract.getReserves();
            console.log('\ntoken 0', token0, reserve0.toString() ); console.log('token 1', token1, reserve1.toString() );

            // 4.确定buyAmount，计算outAmount，将buyAmount抵押并由WETHContract转到lpAddress账户
            let buyAmount = ethers.utils.parseUnits("1", 18);
            console.log("<buyAmount of WETH =", ethers.utils.formatUnits(buyAmount, 18), ">");
            const uniRouter = await new ethers.Contract(UNI_ROUTER, routerV2ABI, ethers.provider);
            //function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) internal pure returns (uint amountOut);
            // 判断reserveIn和reserveOut
            let reserveIn,reserveOut;
            if (token0 == '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')
                {reserveIn = reserve0; reserveOut = reserve1;}
            else
                {reserveIn = reserve1; reserveOut = reserve0;}
            //计算outAmount
            let outAmount = await uniRouter.getAmountOut(buyAmount,reserveIn,reserveOut);
            // let outAmount = await uniRouter.getAmountOut(buyAmount,reserve1,reserve0);
            console.log("<outAmount of another token =", ethers.utils.formatUnits(outAmount, 18), ">\n");

            let deposit_trx = await WETHContract.connect(owner).deposit({ value: buyAmount});
            let deposit_res = await deposit_trx.wait();
            //console.log("","deposit gasUsed: "+deposit_res.gasUsed,"");

            let transfer_trx = await WETHContract.connect(owner).transfer(lpAddress, buyAmount);
            let transfer_res = await transfer_trx.wait();
            //console.log("","transfer gasUsed: "+transfer_res.gasUsed,"");
            // 5.调用lp合约的swap函数进行交换
            try {
                let swap_trx = await lpContract.connect(owner).swap(outAmount, 0, owner.address, []);
                let swap_res = await swap_trx.wait();
                //console.log("","swap gasUsed: "+swap_res.gasUsed,"");
                // 6.统计gasUsed之和
                //let total_gasUsed = Number(deposit_res.gasUsed) + Number(transfer_res.gasUsed) + Number(swap_res.gasUsed); //算上抵押的
                let total_gasUsed = Number(transfer_res.gasUsed) + Number(swap_res.gasUsed); //不算抵押的
                //totalGas[i] = Number(total_gasUsed);
                console.log("","Total gasUsed: "+total_gasUsed,"");
                lib[i] = {lpAdd:"",deposGas:-1,transGas:-1,swapGas:-1,totalGas:-1,default:"success"};
                lib[i].lpAdd = lpAddress;
                lib[i].deposGas = Number(deposit_res.gasUsed);
                lib[i].transGas = Number(transfer_res.gasUsed);
                lib[i].swapGas = Number(swap_res.gasUsed);
                lib[i].totalGas = Number(total_gasUsed);
            } catch (err) {
                //console.log(err.toString());
                lib[i] = {lpAdd:"",deposGas:-1,transGas:-1,swapGas:-1,totalGas:-1,default:"success"};
                lib[i].lpAdd = lpAddress;
                lib[i].default = err.toString();
            } finally {
                fs.writeFileSync(outputPath, JSON.stringify(lib, null, 4), 'utf-8');
            }
        }
        console.log("lib.length",lib.length);
        fs.writeFileSync(outputPath, JSON.stringify(lib, null, 4), 'utf-8');

    });
});