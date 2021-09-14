import {beforeEach, it} from "mocha";
import {libUnit} from "../abis/type_libUnit";
import Min = Mocha.reporters.Min;
const fs = require('fs');

type lpAddress = string;
const inputPath:string = './lpdata/lp_all_gas_info.json';

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
    if (fs.existsSync(inputPath)) //判断是否存在此文件
    {   //创建lp地址数组和gasUsed数组
        let lpInfo: libUnit[] = [];
        //let lpAdds: lpAddress[] = [];
        let unResolveLp: string[] = [];
        //读取文件内容，并转化为Json对象
        let lpGasJsonData = JSON.parse(fs.readFileSync(inputPath,"utf-8"));
        for (let lpA of lpGasJsonData)
        {
            lpInfo.push(lpA); //lpAdds.push(lpA.lpAdd);
            if (lpA.default != "success") { unResolveLp.push(lpA);}
        }

        fs.writeFileSync('./lpdata/unresolved.json', JSON.stringify(unResolveLp, null, 4), 'utf-8');
        //需要将WETH转入lp0，再进行swap将token0转入lp1
        let res0 = lpInfo.find((item)=>{ return item.lpAdd.toUpperCase() == lp[0].toUpperCase()});
        if (res0 == undefined) { console.log("can not find ",lp[0]);}
        else { console.log("lp[",0,"]", lp[0], "tansferGas:", res0.transGas, "swapGas:", res0.swapGas);}

        gasEstimated += lpInfo[0].transGas + lpInfo[0].swapGas;
        //进行其他lp的swap
        for (let i = 1; i < lp.length; i++)
        {
            let res = lpInfo.find((item)=>{ return item.lpAdd.toUpperCase() == lp[i].toUpperCase()});
            if (res != undefined && res.swapGas > 0) { gasEstimated += res.swapGas; console.log("lp[",i,"]",lp[i],"swapGas:",res.swapGas);}
            else { gasEstimated += 0; console.log("lp[",i,"]",lp[i],"gas:",0);}
        }
    }
    gasEstimated -= 21000 * lp.length; //减去本地调用合约多使用的call的gas
    gasEstimated -= 16 * 330 * lp.length; //减去inputdata多使用的gas，swap的inputdata长度为330
    return gasEstimated;
}

describe("Uniswap Gas Estimate", function (){

    let lpADDs:lpAddress[] = ["0xd00ed1098180b1d6ed42b066555ab065c4515493","0xb533193c117920251b3a116e9c86c5347d67a6e6","0x9d406c4067a53f65de1a8a9273d55bfea5870a75"]
    beforeEach(async () => {})
    it("Gas Analysis", async function (){
        let res = AnalysisLP();
        let MaxSwapGas = res[0]; let MinSwapGas = res[1]; let AveSwapGas = res[2];
        console.log("Gas Analysis: ");console.log("MaxSwapGas: ",MaxSwapGas);console.log("MinSwapGas: ",MinSwapGas);console.log("AveSwapGas: ", AveSwapGas);
    });

    it("Gas Estimate", async function (){
        console.log("Gas Estimate: ",estimateLP(lpADDs));
    });

});
