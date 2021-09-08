import { expect } from "chai"
import { ethers } from 'hardhat';
import {IUniswapV2Factory} from "@typechains/IUniswapV2Factory";
import utils from "../src/utils";
import configs from "../src/config";
import {WETH_ABI} from "../abis/WETH";
import {routerV2ABI} from "../abis/router";
import ErrnoException = NodeJS.ErrnoException;
import {BigNumber} from "ethers";
import {copyFileSync} from "fs";
import {log} from "util";
import {ERC20_ABI} from "../abis/ERC20";
const fs = require('fs');
type libUnit = {
    lpAdd: string,
    gasUsed: number,
    default: string
}
describe("UniSwap Gas Predict", function() {

    const inputPath:string = './lpdata/white_no_eth.txt';
    const outputPath:string = './lpdata/lp_no_eth_gas_no_depos.json';
    let uniFactory: IUniswapV2Factory;
    //let uniRouter: unknown;
    const UNI_FACTORY = configs.TokenConfig.UNISWAP_FACTORY;
    const UNI_ROUTER = configs.TokenConfig.UNISWAP_ROUTER;
    const WETH = configs.TokenConfig.WETH; // WETH 合约地址
    let lpAddress: string;
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

    it("Get LP and test Swap ", async function() {
        this.timeout(0);
        const [owner] = await ethers.getSigners();
        let a :number = 3; //amount0需要除的值
        // 0.建立WETH合约实例和router合约实例
        const WETHContract = new ethers.Contract(WETH, WETH_ABI, ethers.provider);
        const uniRouter = await new ethers.Contract(UNI_ROUTER, routerV2ABI, ethers.provider);
        for (let i = 0; i < 1; i++)
        {
            lpAddress = lpAdds[i];
            lpAddress = '0x5a1ABc007f031Aa58238f45941D965cE6892FDfF';
            console.log("lp address is: ", lpAddress);

            //一、确定amout0
            // 1.建立token0和token1的lp实例
            let lpContract = await utils.uniswapTools.getIUniswapV2Pair(lpAddress);
            // 2.得到两种token地址和余额
            let token0 = await lpContract.token0(); let token1 = await lpContract.token1();
            let [reserve0, reserve1] = await lpContract.getReserves();
            console.log('token 0', token0, reserve0.toString() ); console.log('token 1', token1, reserve1.toString() );
            // console.log(typeof reserve0);console.log(Object.getOwnPropertyNames(reserve0));console.log(reserve0._isBigNumber);
            // 3.确定amount0(此时无法确定，因为WETH/token0的lp可能没有这么多的token0，所以amount0 = Min(WETH/token0的lp的token0余额，lp的token0余额).div(a))
            let amount00 :BigNumber = reserve0;
            console.log("\n<Reserve of token0 at lp =", amount00.toString(), ">");

            //二、交换得到数量为amount0的token0
            // 1.得到weth/token0的lp并创建实例
            const WETH_Token0_lpAddress = await uniFactory.getPair(WETH, token0);
            console.log("Weth to Token0 lp address is: ", WETH_Token0_lpAddress);
            const WETH_Token0_lpContract = await utils.uniswapTools.getIUniswapV2Pair(WETH_Token0_lpAddress);
            // 2.确定amount0对应的weth数量（+1，防止小幅度的变化）
            [reserve0, reserve1] = await WETH_Token0_lpContract.getReserves();
            //得到WETH/token0的lp的token0的余额
            let tmpToken0 = await WETH_Token0_lpContract.token0(); let isWethToken0 :number; let amount01 :BigNumber;
            if (tmpToken0 == WETH) //WETH_Token0_lp的tokne0是WETH
            { console.log("WETH_Token0_lp的tokne0是WETH"); isWethToken0 = 1; amount01 = reserve1;}
            else
            { console.log("WETH_Token0_lp的tokne1是WETH"); isWethToken0 = 0; amount01 = reserve0;}
            console.log("<Reserve of token0 at WETH/token0 lp =", amount01.toString(), ">");
            //比较两个lp的token0余额，取较小的值
            let amount0 :BigNumber; let x = Number(amount00.toString()); let y = Number(amount01.toString());
            if (x>y) amount0 = amount01;
            else amount0 = amount00;
            //确定amount0
            amount0 = amount0.div(a);
            console.log("<Amount of token0 =", amount0.toString(), ">\n");
            //确定需要weth的数量
            let wethAmount :BigNumber;
            if (isWethToken0 == 1) //WETH_Token0_lp的tokne0是WETH
            { wethAmount = await uniRouter.getAmountIn(amount0,reserve0,reserve1);}
            else //WETH_Token0_lp的tokne1是WETH
            { wethAmount = await uniRouter.getAmountIn(amount0,reserve1,reserve0);}
            console.log("<Amount of Weth =", ethers.utils.formatUnits(wethAmount,18), ">");
            let extra :BigNumber = ethers.utils.parseUnits("1",18);
            wethAmount = wethAmount.add(extra);
            console.log("<Amount of Weth =", ethers.utils.formatUnits(wethAmount,18), ">");
            // 3.将等量的eth抵押得到weth
            ////let wethReserve = await WETHContract.balanceOf(owner.address); console.log("WETH reserve of owner before deposit is:", ethers.utils.formatUnits(wethReserve,18));
            let deposit_trx = await WETHContract.connect(owner).deposit({ value: wethAmount});
            ////wethReserve = await WETHContract.balanceOf(owner.address); console.log("WETH reserve of owner after deposit is:", ethers.utils.formatUnits(wethReserve,18));
            // 4.将weth发送到weth/token0的lp
            let WETH_transfer_trx = await WETHContract.connect(owner).transfer(WETH_Token0_lpAddress, wethAmount);
            ////wethReserve = await WETHContract.balanceOf(owner.address); console.log("WETH reserve of owner after transfer is:", ethers.utils.formatUnits(wethReserve,18));
            // 5.进行交换得到amount0的token0
            let token0Contract = new ethers.Contract(token0, ERC20_ABI, ethers.provider);
            ////let token0Reserve = await token0Contract.balanceOf(owner.address);console.log("Token 0 reserve of owner after transfer is:", token0Reserve.toString());
            let swap0_trx;
            if (tmpToken0 == WETH) //WETH_Token0_lp的tokne0是WETH
            { swap0_trx = await WETH_Token0_lpContract.connect(owner).swap(0, amount0, owner.address, []);}
            else //WETH_Token0_lp的tokne1是WETH
            { swap0_trx = await WETH_Token0_lpContract.connect(owner).swap(amount0, 0, owner.address, []);}
            ////token0Reserve = await token0Contract.balanceOf(owner.address);console.log("Token 0 reserve of owner after transfer is:", token0Reserve.toString());

            //三、交换得到amount1的token1
            // 1.确定数量为amount0的token0对应的token1的数量amount1
            [reserve0, reserve1] = await lpContract.getReserves();
            let amount1 = await uniRouter.getAmountOut(amount0,reserve0,reserve1);
            console.log("<Amount of token1 =", amount1.toString(), ">");
            // 2.将数量为amount0的token0发送到lp
            let token0_transfer = await token0Contract.connect(owner).transfer(lpAddress, amount0);
            let token0_transfer_res = await token0_transfer.wait();
            console.log("\n","transfer gasUsed: "+token0_transfer_res.gasUsed,"");
            // 3.进行交换得到amount1的token1
            try {
                let swap1_trx = await lpContract.connect(owner).swap(0, amount1, owner.address, [])
                let swap1_res = await swap1_trx.wait();
                console.log("","swap gasUsed: "+swap1_res.gasUsed,"");

                let total_gasUsed = Number(token0_transfer_res.gasUsed) + Number(swap1_res.gasUsed);
                console.log("","total gasUsed: "+total_gasUsed,"");
                lib[i] = {lpAdd:"",gasUsed:-1,default:"success"};
                lib[i].lpAdd = lpAddress;
                lib[i].gasUsed = Number(total_gasUsed);
            } catch (err) {
                //console.log(err.toString());
                lib[i] = {lpAdd:"",gasUsed:-1,default:"success"};
                lib[i].lpAdd = lpAddress;
                lib[i].default = err.toString();
            } finally {
                fs.writeFileSync(outputPath, JSON.stringify(lib, null, 4), 'utf-8');
            }

        }
        console.log(lib.length);
        for (let j = 0; j < lib.length; j++)
            console.log(lib[j].lpAdd,lib[j].gasUsed);

        fs.writeFileSync(outputPath, JSON.stringify(lib, null, 4), 'utf-8');
    });
});