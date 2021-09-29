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
import {libUnit} from "../abis/type_libUnit";
import {ERC20_ABI} from "../abis/ERC20";
describe("UniSwap Gas Predict", function() {

    const inputPath:string = './lpdata/white_eth.txt';
    const outputPath:string = './lpdata/lp_eth_gas_info_unresolved.json';
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
        for(let i of arr)
        {
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
        const [lll,owner] = await ethers.getSigners();
        // 0.建立WETH合约实例
        const WETHContract = new ethers.Contract(WETH, WETH_ABI, ethers.provider);
        for (let i = 0; i < 1; i++)
        {
            lpAddress = lpAdds[i];
            lpAddress = '0x75C5f8506Af2f43360a82d77cE168127D0D642a9';
            console.log(i, ":lp address is: ", lpAddress);

            // 1.先通过utils.uniswapTools.getIUniswapV2Pair(lpAddress)建立lp合约实例lpContract
            let lpContract = await utils.uniswapTools.getIUniswapV2Pair(lpAddress);

            // 2.lpContract.token0()，lpContract.token1()可以得到lp对应的两种token
            let token0 = await lpContract.token0(); let token1 = await lpContract.token1();
            //判断token0和token1哪个是WETH并用isWethToken0表示
            let isWethToken0 :number;
            if (token0 == WETH) { console.log("lp的tokne0是WETH"); isWethToken0 = 1;}
            else { console.log("lp的tokne1是WETH"); isWethToken0 = 0;}

            // 3.通过lpContract.getReserves()可以得到token0和token1的余额
            let [reserve0, reserve1] = await lpContract.getReserves();
            console.log('\ntoken 0', token0, reserve0.toString() ); console.log('token 1', token1, reserve1.toString() );

            // 4.确定buyAmount，计算outAmount，将buyAmount抵押并由WETHContract转到lpAddress账户
            let buyAmount = ethers.utils.parseUnits("1", 18);
            console.log("<buyAmount of WETH =", ethers.utils.formatUnits(buyAmount, 18), ">");
            const uniRouter = await new ethers.Contract(UNI_ROUTER, routerV2ABI, ethers.provider);
            //function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) internal pure returns (uint amountOut);
            // 判断reserveIn和reserveOut
            let reserveIn,reserveOut;
            if (isWethToken0 == 1)
                {reserveIn = reserve0; reserveOut = reserve1;}
            else
                {reserveIn = reserve1; reserveOut = reserve0;}
            //计算outAmount
            let outAmount = await uniRouter.getAmountOut(buyAmount,reserveIn,reserveOut);
            // let outAmount = await uniRouter.getAmountOut(buyAmount,reserve1,reserve0);
            console.log("<outAmount of another token =", ethers.utils.formatUnits(outAmount, 18), ">\n");

            let deposit_trx = await WETHContract.connect(owner).deposit({ value: buyAmount});
            let deposit_res = await deposit_trx.wait();
            console.log("","deposit gasUsed: "+deposit_res.gasUsed,"");
            let transfer_trx = await WETHContract.connect(owner).transfer(lpAddress, buyAmount);
            //console.log("---------",transfer_trx,"------------");
            let transfer_res = await transfer_trx.wait();
            console.log("","transfer gasUsed: "+transfer_res.gasUsed,"");

            // 5.调用lp合约的swap函数进行交换
            try {
                let swap0t1_res,swap1t0_res;
                if (isWethToken0 == 1)
                {
                    let swap0t1_trx = await lpContract.connect(owner).swap(0, outAmount, owner.address, []);
                    swap0t1_res = await swap0t1_trx.wait();
                    console.log("","swap0t1 gasUsed: ",Number(swap0t1_res.gasUsed),"");

                    let token1Contract = new ethers.Contract(token1, ERC20_ABI, ethers.provider);
                    outAmount = outAmount.div(2);
                    let token1_transfer = await token1Contract.connect(owner).transfer(lpAddress, outAmount);
                    let amount0 = await uniRouter.getAmountOut(outAmount,reserve1,reserve0);
                    let swap1t0_trx = await lpContract.connect(owner).swap(amount0, 0, owner.address, [])
                    swap1t0_res = await swap1t0_trx.wait();
                    console.log("","swap1t0 gasUsed: ",Number(swap1t0_res.gasUsed),"\n");
                }
                else
                {
                    let swap1t0_trx = await lpContract.connect(owner).swap(outAmount, 0, owner.address, []);
                    swap1t0_res = await swap1t0_trx.wait();
                    console.log("","swap1t0 gasUsed: ",Number(swap1t0_res.gasUsed),"");

                    let token0Contract = new ethers.Contract(token0, ERC20_ABI, ethers.provider);

                    // console.log(owner.address)
                    let ownerTk0Balance = await token0Contract.balanceOf(owner.address); ////////////////////////////////////
                    // console.log(ownerTk0Balance.toString());
                    // console.log(outAmount.toString());
                    outAmount = outAmount.div(2);
                    // console.log(outAmount.toString());
                    let token0_transfer = await token0Contract.connect(owner).transfer(lpAddress, outAmount);
                    let amount1 = await uniRouter.getAmountOut(outAmount,reserve0,reserve1);
                    let swap0t1_trx = await lpContract.connect(owner).swap(0, amount1, owner.address, [])
                    swap0t1_res = await swap0t1_trx.wait();
                    console.log("","swap0t1 gasUsed: ",Number(swap0t1_res.gasUsed),"\n");
                }

                lib[i] = {lpAdd:"",token0:"",token1:"",swapGas0t1:-2,swapGas1t0:-3,default:"success"};
                lib[i].lpAdd = lpAddress;
                lib[i].token0 = token0;
                lib[i].token1 = token1;
                lib[i].swapGas0t1 = isWethToken0 ? Number(swap0t1_res.gasUsed) : Number(swap1t0_res.gasUsed);
                lib[i].swapGas1t0 = isWethToken0 ? Number(swap1t0_res.gasUsed) : Number(swap0t1_res.gasUsed);
            } catch (err) {
                console.log(err.toString());
                lib[i] = {lpAdd:"",token0:"",token1:"",swapGas0t1:-2,swapGas1t0:-3,default:"success"};
                lib[i].lpAdd = lpAddress;
                lib[i].token0 = token0;
                lib[i].token1 = token1;
                lib[i].default = err.toString();
            } finally {
                fs.writeFileSync(outputPath, JSON.stringify(lib, null, 4), 'utf-8');
            }
        }
        console.log("lib.length",lib.length);
        fs.writeFileSync(outputPath, JSON.stringify(lib, null, 4), 'utf-8');

    });
});