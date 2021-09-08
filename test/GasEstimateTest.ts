import {beforeEach, it} from "mocha";
import {string} from "hardhat/internal/core/params/argumentTypes";
const fs = require('fs');

type lpAddress = string;
type BigNumber = number;
const inputPath:string = './lpdata/lp_eth_gas_no_depos.json';
function estimateLP(lp: lpAddress[]): BigNumber{
    let gasEstimated:number = 0;
    if (fs.existsSync(inputPath)) //判断是否存在此文件
    {   //创建lp地址数组和gasUsed数组
        let lpAdds: string[] = [];
        let lpGas: number[] = [];
        //读取文件内容，并转化为Json对象
        let lpEthGasJsonData = JSON.parse(fs.readFileSync(inputPath,"utf-8"));
        for (let lpA of lpEthGasJsonData) { lpAdds.push(lpA.lpAdd); lpGas.push(lpA.gasUsed); }

        for (let i = 0; i < lp.length; i++)
        {   //if (lpAdds.find(function (value,index,arr){ return (value === lp[i], index); }))
            let res = lpAdds.indexOf(lp[i]);
            if (res != -1 && lpGas[res] != -1) { gasEstimated += lpGas[res]; }
            else { gasEstimated += 0; }
        }
    }
    return gasEstimated;
}

describe("Uniswap Gas Estimate", function (){

    let lpADDs:lpAddress[] = ['0x43AE24960e5534731Fc831386c07755A2dc33D47', '0xd535dbf27942551A98Cd0723552BDAf70628DbF8',
                              '0x8d2A4cC2E2cA0f7ab011b686449DC82C3aF924c7']
    beforeEach(async () => {})
    it("Gas Estimate", async function (){
        console.log("Gas Estimate: ",estimateLP(lpADDs));
    });

});
