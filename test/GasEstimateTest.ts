import {beforeEach, it} from "mocha";
import {libUnit} from "../abis/type_libUnit";
import configs from "../src/config";
import Min = Mocha.reporters.Min;
const fs = require('fs');

type lpAddress = string;
const inputPath:string = './lpdata/lp_all_gas_info.json';
//const inputPath:string = './lpdata/lp_eth_gas_info_unresolved.json';

function AnalysisLP(): Array<number>{
    //分析lp的swapGas的最大值，最小值，平均值
    let res: number[] = [];
    let swaps: number[] = [];
    if (fs.existsSync(inputPath))
    {
        let lpGasJsonData = JSON.parse(fs.readFileSync(inputPath,"utf-8"));
        for (let lpA of lpGasJsonData)
            { if (lpA.swapGas > 0) swaps.push(lpA.swapGas);}
        let MaxSwapGas = Math.max(...swaps);
        //console.log("MaxSwapGas: ",MaxSwapGas);
        let MinSwapGas = Math.min(...swaps);
        //console.log("MinSwapGas: ",MinSwapGas);
        let sum = swaps.reduce(function (prev,cur,index,array){
            return prev + cur;
        })
        let len = swaps.length;
        let AveSwapGas = Math.round((sum-MaxSwapGas-MinSwapGas)/(len-2));
        //console.log("AveSwapGas: ", AveSwapGas);
        res.push(MaxSwapGas, MinSwapGas, AveSwapGas);
    }
    return res;

}

function estimateLP(lp: lpAddress[]): number{
    let gasEstimated:number = 0;
    const wethToken = configs.TokenConfig.WETH;
    let nextToken:string = "0x000000";
    if (fs.existsSync(inputPath)) { //判断是否存在此文件
        //创建lp地址数组和gasUsed数组
        let lpInfo: libUnit[] = [];
        //let lpAdds: lpAddress[] = [];
        let unResolveLp: string[] = [];
        //读取文件内容，并转化为Json对象
        let lpGasJsonData = JSON.parse(fs.readFileSync(inputPath,"utf-8"));
        for (let lpA of lpGasJsonData) {
            lpInfo.push(lpA); //lpAdds.push(lpA.lpAdd);
            if (lpA.default != "success") { unResolveLp.push(lpA);}
        }
        fs.writeFileSync('./lpdata/unresolved.json', JSON.stringify(unResolveLp, null, 4), 'utf-8');

        //需要将WETH转入lp0，再进行swap将token0转入lp1
        let transferGas:number = 29694; //transfer消耗的gas
        gasEstimated += transferGas; console.log("tansferGas:", transferGas);
        //需要获得lp0的swapGas，首先需要判断方向
        let res0 = lpInfo.find((item)=>{ return item.lpAdd.toUpperCase() == lp[0].toUpperCase()});
        if (res0 != undefined) {
            if (res0.token0 == wethToken)
            { console.log("lp[",0,"]", lp[0], "swapGas:", res0.swapGas0t1); gasEstimated += res0.swapGas0t1; nextToken = res0.token1;}
            else if (res0.token1 == wethToken)
            { console.log("lp[",0,"]", lp[0], "swapGas:", res0.swapGas1t0); gasEstimated += res0.swapGas1t0; nextToken = res0.token0; }
            else
            { console.log("lp0中不包含Weth!!!"); return -1; }
        }
        else {
            console.log("Can not find ",lp[0],"!!!");
        }
        //进行其他lp的swap
        for (let i = 1; i < lp.length; i++) {
            let res = lpInfo.find((item)=>{ return item.lpAdd.toUpperCase() == lp[i].toUpperCase()});
            if (res != undefined) {
                if (res.token0 == nextToken)
                { gasEstimated += res.swapGas0t1; console.log("lp[",i,"]",lp[i],"swapGas:",res.swapGas0t1); nextToken = res.token1; }
                else if (res.token1 == nextToken)
                { gasEstimated += res.swapGas1t0; console.log("lp[",i,"]",lp[i],"swapGas:",res.swapGas1t0); nextToken = res.token0; }
                else
                { console.log("存在token顺序错误!!!"); return -1; }
            }
            else {
                console.log("lp[",i,"]",lp[i],"gas:",0); console.log("Can not find lp[", i, "]:", lp[i], "!!!");
            }
        }
    }
    console.log("lp.length: ",lp.length)
    gasEstimated -= 21000 * (lp.length + 1); //减去本地调用合约多使用的call的gas
    gasEstimated -= 16 * 330 * lp.length; //减去inputdata多使用的gas，swap的inputdata长度为330
    gasEstimated -= 16 * 138; //减去inputdata多使用的gas，transfer的inputdata长度为138
    return gasEstimated;
}

describe("Uniswap Gas Estimate", function (){

    let lpADDs:lpAddress[] = ["0x7818a7e2ab095a15dcb348c7dd6d1d88d7ceabfd","0x40449d1f4c2d4f88dfd5b18868c76738a4e52fd4"]
    beforeEach(async () => {})
    // it("Gas Analysis", async function (){
    //     let res = AnalysisLP();
    //     let MaxSwapGas = res[0]; let MinSwapGas = res[1]; let AveSwapGas = res[2];
    //     console.log("Gas Analysis: ");console.log("MaxSwapGas: ",MaxSwapGas);console.log("MinSwapGas: ",MinSwapGas);console.log("AveSwapGas: ", AveSwapGas);
    // });

    it("Gas Estimate", async function (){
        console.log("Gas Estimate: ",estimateLP(lpADDs));
    });

});
