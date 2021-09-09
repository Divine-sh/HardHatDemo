import {beforeEach, it} from "mocha";
import {libUnit} from "../abis/type_libUnit";
const fs = require('fs');

type lpAddress = string;
const inputPath:string = './lpdata/lp_all_gas_info.json';
function estimateLP(lp: lpAddress[]): number{
    let gasEstimated:number = 0;
    if (fs.existsSync(inputPath)) //判断是否存在此文件
    {   //创建lp地址数组和gasUsed数组
        let lpInfo: libUnit[] = [];
        let lpAdds: string[] = [];
        let unResolveLp: string[] = [];
        //读取文件内容，并转化为Json对象
        let lpEthGasJsonData = JSON.parse(fs.readFileSync(inputPath,"utf-8"));
        for (let lpA of lpEthGasJsonData)
        {
            lpInfo.push(lpA); lpAdds.push(lpA.lpAdd);
            if (lpA.default != "success") unResolveLp.push(lpA);
        }

        fs.writeFileSync('./lpdata/unresolved.json', JSON.stringify(unResolveLp, null, 4), 'utf-8');

        //需要将WETH转入lp0，再进行swap将token0转入lp1
        console.log("lp[",0,"]", lpInfo[0].lpAdd, "tansfer gas:", lpInfo[0].transGas, "swap gas:", lpInfo[0].swapGas);
        gasEstimated += lpInfo[0].transGas + lpInfo[0].swapGas;
        //进行其他lp的swap
        for (let i = 1; i < lp.length; i++)
        {   //if (lpAdds.find(function (value,index,arr){ return (value === lp[i], index); }))
            let res = lpAdds.indexOf(lp[i]);
            if (res != -1 && lpInfo[res].swapGas > 0)
            { gasEstimated += lpInfo[res].swapGas; console.log("lp[",i,"]",lpAdds[i],"gas:",lpInfo[res].swapGas);}
            else
            { gasEstimated += 0; console.log("lp[",i,"]",lpAdds[i],"gas:",0);}
        }
    }
    return gasEstimated;
}

describe("Uniswap Gas Estimate", function (){

    let lpADDs:lpAddress[] = ['0x8d2a4cc2e2ca0f7ab011b686449dc82c3af924c7', '0xd535dbf27942551a98cd0723552bdaf70628dbf8',
                              '0x43ae24960e5534731fc831386c07755a2dc33d47']
    beforeEach(async () => {})
    it("Gas Estimate", async function (){
        console.log("Gas Estimate: ",estimateLP(lpADDs));
    });

});
