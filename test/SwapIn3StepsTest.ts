import { ethers } from "hardhat";
import configs from "../src/config";
import ABICONFIG from "../abis";
import { lpv2ABI } from "../abis/lpv2";
import { routerV2ABI } from "../abis/router";
import { USDC_ABI } from "../abis/usdc";
import { WETH_ABI } from "../abis/WETH";
import { UNI_ABI } from "../abis/UNI";



describe("UniSwap contract swapping in 3 steps test", function () {

  // Define the addresses for tokens
  const uniFactoryToken = configs.TokenConfig.UNISWAP_FACTORY;
  const wethToken = configs.TokenConfig.WETH;
  const uniToken = configs.TokenConfig.UNI_TOKEN;
  const usdcToken = configs.TokenConfig.USDC;
  const routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const myETHAddress = "0xB13908caBC896127C66241469AEfDd0372900927";

  beforeEach(async () => {});

  it("Swap unittest", async function () {

    const wethContract = new ethers.Contract(wethToken, WETH_ABI, ethers.provider);
    const uniContract = new ethers.Contract(uniToken, UNI_ABI, ethers.provider);
    const routerContract = new ethers.Contract(routerAddress, routerV2ABI, ethers.provider);
    const uniFactoryContract = new ethers.Contract(uniFactoryToken, ABICONFIG.UNIFACTORY_ABI, ethers.provider);

    const [signer] = await ethers.getSigners();
    const lpAddress = await uniFactoryContract.getPair(wethToken, uniToken);
    console.log('Step1, deposit WETH:\nlpAddress', lpAddress)
    const lpContract = new ethers.Contract(lpAddress, lpv2ABI, ethers.provider);

    let [reserve0, reserve1] = await lpContract.getReserves(); // reserve0 -> UNI, reserve1 -> WETH
    let buyAmount = ethers.utils.parseUnits('1', 18);
    let outAmount = await routerContract.getAmountOut(buyAmount, reserve1, reserve0);
    console.log('UNI outAmount =', ethers.utils.formatUnits(outAmount, 18));

    // Step1: signer 抵押 1 ETH -> WETH，并将 1 WETH 存到 lpContract
    // lpContract 的 WETH 余额会增加 1
    const depositRes = await wethContract.connect(signer).deposit({ value: buyAmount });
    // console.log('depositRes wait', await depositRes.wait());

    let lpWethBalance = await wethContract.balanceOf(lpAddress);
    console.log('lpWethBalance before transferring', ethers.utils.formatUnits(lpWethBalance, 18));

    const transferRes = await wethContract.connect(signer).transfer(lpAddress, buyAmount);
    // console.log('transferRes wait', await transferRes.wait());

    lpWethBalance = await wethContract.balanceOf(lpAddress);
    console.log('lpWethBalance after transferring', ethers.utils.formatUnits(lpWethBalance, 18));


    // Step2: signer 将存放在 lpContract 的 1 WETH 转换为 outAmount UNI
    // lpContract 的 UNI 余额减少 outAmount，newLpContract 的 UNI 余额增加 outAmount
    console.log('\n\nStep2, transfer WETH to UNI:');
    let lpUniBalance = await uniContract.balanceOf(lpAddress);
    console.log('lpUniBalance before swapping =', ethers.utils.formatUnits(lpUniBalance, 18));

    const newLpAddress = await uniFactoryContract.getPair(uniToken, usdcToken);
    let newLpUniBalance = await uniContract.balanceOf(newLpAddress);
    console.log('newLpUniBalance before swapping =', ethers.utils.formatUnits(newLpUniBalance, 18));

    await lpContract.connect(signer).swap(outAmount, 0, newLpAddress, []);

    lpUniBalance = await uniContract.balanceOf(lpAddress);
    console.log('lpUniBalance after swapping =', ethers.utils.formatUnits(lpUniBalance, 18))

    newLpUniBalance = await uniContract.balanceOf(newLpAddress);
    console.log('newLpUniBalance after swapping =', ethers.utils.formatUnits(newLpUniBalance, 18))

    // Step3: signer 将存放在 newLpContract 的 outAmount UNI 转换为 USDC 并转到 myETHAddress
    // newLpContract 的 USDC 余额减少 outAmount，myETHAddress 的 USDC 余额增加 outAmount
    console.log('\n\nStep3, transfer UNI to USDC:')
    const newLpContract = new ethers.Contract(newLpAddress, lpv2ABI, ethers.provider);
    [reserve0, reserve1] = await newLpContract.getReserves(); //reserve0 ->  UNI, reserve1 -> USDC
    outAmount = await routerContract.getAmountOut(outAmount, reserve0, reserve1);
    console.log('USDC outAmount =', ethers.utils.formatUnits(outAmount, 6))

    const usdcContract = new ethers.Contract(usdcToken, USDC_ABI, ethers.provider);
    let myUsdcBalance = await usdcContract.balanceOf(myETHAddress);
    console.log('myUsdcBalance before swapping', ethers.utils.formatUnits(myUsdcBalance, 6));

    await newLpContract.connect(signer).swap(0, outAmount, myETHAddress, [])
    myUsdcBalance = await usdcContract.balanceOf(myETHAddress);
    console.log('myUsdcBalance after swapping', ethers.utils.formatUnits(myUsdcBalance, 6));
  });
});
