import {beforeEach, it} from "mocha";
import {string} from "hardhat/internal/core/params/argumentTypes";
const fs = require('fs');

type lpAddress = string;
type BigNumber = number;
const inputPath:string = './lpdata/lp_all_gas_info.json';
function estimateLP(lp: lpAddress[]): BigNumber{
    let gasEstimated:number = 0;
    if (fs.existsSync(inputPath)) //判断是否存在此文件
    {   //创建lp地址数组和gasUsed数组
        let lpAdds: string[] = [];
        let lpGas: number[] = [];
        let unResolveLp: string[] = [];
        //读取文件内容，并转化为Json对象
        let lpEthGasJsonData = JSON.parse(fs.readFileSync(inputPath,"utf-8"));
        for (let lpA of lpEthGasJsonData)
        {
            lpAdds.push(lpA.lpAdd); lpGas.push(lpA.gasUsed);
            if (lpA.default != "success") unResolveLp.push(lpA);
        }

        fs.writeFileSync('./lpdata/unresolved.json', JSON.stringify(unResolveLp, null, 4), 'utf-8');

        for (let i = 0; i < lp.length; i++)
        {   //if (lpAdds.find(function (value,index,arr){ return (value === lp[i], index); }))
            let res = lpAdds.indexOf(lp[i]);
            if (res != -1 && lpGas[res] != -1) { gasEstimated += lpGas[res]; console.log("lp[",i,"]",lpAdds[i],"gas:",lpGas[res]);}
            else { gasEstimated += 0; console.log("lp[",i,"]",lpAdds[i],"gas:",0);}
        }
    }
    return gasEstimated;
}

describe("Uniswap Gas Estimate", function (){

    let lpADDs:lpAddress[] = ['0x8F190eDeFBB2A597572bf21f3F73469636Aa59b1', '0x0D88ba937A8492AE235519334Da954EbA73625dF',
                              '0x9Ab32555Bf5A51C922aeE7D2e7c41b2ecf798863']
    beforeEach(async () => {})
    it("Gas Estimate", async function (){
        console.log("Gas Estimate: ",estimateLP(lpADDs));
    });

});
