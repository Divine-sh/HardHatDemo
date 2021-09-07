import {beforeEach, it} from "mocha";
import {string} from "hardhat/internal/core/params/argumentTypes";
const fs = require('fs');

type lpAddress = {
    address: string
}
type BigNumber = {
    _hex: string,
    _isBigNumber:boolean
}
const inputPath:string = './lpdata/lp_eth_gas_depos.json';
function estimateLP(lp:lpAddress[]): BigNumber{
    if (fs.existsSync(inputPath))
    {
        let lp_gth_
    }
}
    if (fs.existsSync(inputPath)) //判断是否存在此文件
    {
        //读取文件内容，并转化为Json对象
        let userBugsJson = JSON.parse(fs.readFileSync("app/public/static/Data.json", "utf8"));
        //获取Json里key为data的数据
        const data = userBugsJson['data'];
        return data;

}

describe("Uniswap Gas Estimate", function (){

    beforeEach(async () => {})
    it("Gas Estimate", async function (){

    });

});
