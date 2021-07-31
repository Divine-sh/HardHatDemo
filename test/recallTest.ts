import utils from "../src/utils";
import {getIUniswapV2Pair} from "../src/utils/uniswapTools";

describe("recall", ()=>{
    //usdc weth lp
    let lp='0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc'
    it("12930983",async ()=>{
        let block =12930983;
        utils.changeForkBlockV2(block);
        let lpPair = await getIUniswapV2Pair(lp)

        let reserve = await lpPair.getReserves();
        console.log('reserve', reserve.reserve0.toString(), reserve.reserve1.toString());
    });

    it("12930900",async ()=>{
        let block =12930900;
        utils.changeForkBlockV2(block);
        let lpPair = await getIUniswapV2Pair(lp)

        let reserve = await lpPair.getReserves();
        console.log('reserve', reserve.reserve0.toString(), reserve.reserve1.toString());
    });

})