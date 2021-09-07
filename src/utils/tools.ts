import configs from "../config";

async function changeForkBlockV2(blockNumber:number){
  const hre = require("hardhat");

  await hre.network.provider.request({
    method: "hardhat_reset",
    params: [{
      forking: {
        // configs.ETH_r
        jsonRpcUrl: configs.ETH_RPC,
        blockNumber: blockNumber
      }
    }]
  })
}

export {
   changeForkBlockV2
}
