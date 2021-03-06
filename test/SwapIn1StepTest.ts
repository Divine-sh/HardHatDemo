import { ethers } from "hardhat";
import configs from "../src/config";
import { routerV2ABI } from "../abis/router";
import { USDC_ABI } from "../abis/USDC";

describe("UniSwap contract swapping in 1 step test", function () {
  const wethToken = configs.TokenConfig.WETH;
  const usdcToken = configs.TokenConfig.USDC;

  const myETHAddress = "0xB13908caBC896127C66241469AEfDd0372900927";
  const router02Address = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const router02Contract = new ethers.Contract(router02Address, routerV2ABI, ethers.provider);

  beforeEach(async () => {});

  it("Swap unittest", async function () {
    /*
     * Case 的作用：拥有 ETH 的账户 signer 一步直接将 ETH 兑换成 USDC 并转给目标用户
     *
     * 步骤：先使用 getAmountsOut 算一下 1 ETH(WETH) 可以换多少个 USDC （非必须，只是方便核验）
     *      再调用 swapExactETHForTokens 将 1 ETH 对应的 USDC 转给目标用户
     * */

    const ethAmount = ethers.utils.parseUnits("1", 18);
    const [_, amountOut] = await router02Contract.getAmountsOut(ethAmount, [wethToken, usdcToken,]);
    console.log("amountOut =", ethers.utils.formatUnits(amountOut, 6));

    const timestamp = Math.round(new Date().getTime() / 1000) + 1000;
    const formattedTimestamp = ethers.utils.parseUnits(`${timestamp}`);
    const [signer] = await ethers.getSigners();

    const usdcContract = new ethers.Contract(usdcToken, USDC_ABI, ethers.provider);
    let myUsdcBalance = await usdcContract.balanceOf(myETHAddress);
    console.log("Before swapping, myUsdcBalance =", ethers.utils.formatUnits(myUsdcBalance, 6));

    // amountOutMin: The minimum amount of output tokens that must be received for the transaction not to revert.
    const amountOutMin = ethers.utils.parseUnits("1000", 6);
    await router02Contract
      .connect(signer)
      .swapExactETHForTokens(
        amountOutMin,
        [wethToken, usdcToken],
        myETHAddress,
        formattedTimestamp,
        { value: ethAmount }
      );

    myUsdcBalance = await usdcContract.balanceOf(myETHAddress);
    console.log("After swapping, myUsdcBalance =", ethers.utils.formatUnits(myUsdcBalance, 6));
  });
});
