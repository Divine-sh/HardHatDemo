import { ethers } from "hardhat";
import configs from "../src/config";
import ABICONFIG from "../abis";
import { lpv2ABI } from "../abis/lpv2";
import { routerV2ABI } from "../abis/router";
import { USDC_ABI } from "../abis/usdc";
import { WETH_ABI } from "../abis/weth";

describe("UniSwap contract Test", function () {
  const UNI_FACTORY = configs.TokenConfig.UNISWAP_FACTORY;
  const WETH = configs.TokenConfig.WETH; // WETH 合约地址
  const USDC = configs.TokenConfig.USDC; // USDC 合约地址
  const routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Uniswap V2 Router 合约地址
  //const myETHAddress = "0xB13908caBC896127C66241469AEfDd0372900927"; // 个人 ETH 钱包地址

  beforeEach(async () => {});

  it("Swap unittest", async function () {
    //创建工厂合约实例
    const uniFactory = new ethers.Contract(UNI_FACTORY, ABICONFIG.UNIFACTORY_ABI, ethers.provider);
    //获取lp地址并创建lp合约实例
    const lpAddress = await uniFactory.getPair(WETH, USDC);
    console.log('lp address', lpAddress);
    const lpContract = new ethers.Contract(lpAddress, lpv2ABI, ethers.provider);

    const WETHContract = new ethers.Contract(WETH, WETH_ABI, ethers.provider);
    const USDCContract = new ethers.Contract(USDC, USDC_ABI, ethers.provider);

    //获取钱包地址
    const [newWallet] = await ethers.getSigners();
    console.log('newWallet address:',newWallet.address);
    //console.log('newWallet:',newWallet);
    const myETHAddress = newWallet.address;

    // 查询交易前的两个账户的两种币的余额
    const LPWethBalanceBeforeSwapping = await WETHContract.balanceOf(lpAddress);
    const MyWethBalanceBeforeSwapping = await WETHContract.balanceOf(myETHAddress);
    console.log("\n\nLP WETH Balance Before Swapping =", ethers.utils.formatUnits(LPWethBalanceBeforeSwapping, 18));
    console.log("My WETH Balance Before Swapping =", ethers.utils.formatUnits(MyWethBalanceBeforeSwapping, 18));

    const LPUSDCBalanceBeforeSwapping = await USDCContract.balanceOf(lpAddress);
    const MyUSDCBalanceBeforeSwapping = await USDCContract.balanceOf(myETHAddress);
    console.log("LP USDC Balance Before Swapping =", ethers.utils.formatUnits(LPUSDCBalanceBeforeSwapping, 6));
    console.log("My USDC Balance Before Swapping =", ethers.utils.formatUnits(MyUSDCBalanceBeforeSwapping, 6));

    let [reserve0, reserve1] = await lpContract.getReserves();
    console.log(reserve0);
    const routerContract = new ethers.Contract(routerAddress, routerV2ABI, ethers.provider);
    let buyAmount = ethers.utils.parseUnits("200", 18);
    console.log(typeof buyAmount);
    console.log("buyAmount: ",ethers.utils.formatUnits(buyAmount, 18));
    let outAmount = await routerContract.getAmountOut(buyAmount, reserve1, reserve0);
    console.log("outAmount: ",ethers.utils.formatUnits(outAmount, 6));

    // 将 buyAmount 抵押并由 WETHContract 转到 LPAddress 账户
    let deposit_trx = await WETHContract.connect(newWallet).deposit({ value: buyAmount });
    let deposit_res = await deposit_trx.wait();
    console.log("\n\n","deposit gasUsed: "+deposit_res.gasUsed,"\n\n");

    let transfer_trx = await WETHContract.connect(newWallet).transfer(lpAddress, buyAmount);
    let transfer_res = await transfer_trx.wait()
    console.log("\n\n","transfer gasUsed: "+transfer_res.gasUsed,"\n\n");

    console.log("\n<buyAmount of USDC =", ethers.utils.formatUnits(outAmount, 6), ">\n");
    console.log("The swapping is starting ...");
    let swap_trx = await lpContract.connect(newWallet).swap(outAmount, 0, myETHAddress, []);
    let swap_res = await swap_trx.wait()
    console.log("\n\n","swap gasUsed: "+swap_res.gasUsed,"\n\n");
    //console.log("\n\n",swap_res,"\n\n");
    console.log("The swapping has done.\n\n");
    let total_gasUsed = Number(deposit_res.gasUsed) + Number(transfer_res.gasUsed) + Number(swap_res.gasUsed);
    console.log("\n\n","Total gasUsed: "+total_gasUsed,"\n\n");


    // 查询交易后的两个账户的两种币的余额
    const LPWethBalanceAfterSwapping = await WETHContract.balanceOf(lpAddress);
    const MyWethBalanceAfterSwapping = await WETHContract.balanceOf(myETHAddress);

    console.log("LP WETH Balance After Swapping =", ethers.utils.formatUnits(LPWethBalanceAfterSwapping, 18));
    console.log("My WETH Balance After Swapping =", ethers.utils.formatUnits(MyWethBalanceAfterSwapping, 18));

    const LPUSDCBalanceAfterSwapping = await USDCContract.balanceOf(lpAddress);
    const MyUSDCBalanceAfterSwapping = await USDCContract.balanceOf(myETHAddress);

    console.log("LP USDC Balance After Swapping =", ethers.utils.formatUnits(LPUSDCBalanceAfterSwapping, 6));
    console.log("My USDC Balance After Swapping =", ethers.utils.formatUnits(MyUSDCBalanceAfterSwapping, 6), "\n\n");
  });
});
