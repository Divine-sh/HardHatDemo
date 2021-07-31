
async function changeForkBlockV2(blockNumber:number){
  const hre = require("hardhat");

  await hre.network.provider.request({
    method: "hardhat_reset",
    params: [{
      forking: {
        jsonRpcUrl: "https://eth-mainnet.alchemyapi.io/v2/rOoHfJirs6LdjKEeZvubWl8V72BQctGB",
        blockNumber: blockNumber
      }
    }]
  })
}

export {
   changeForkBlockV2
}
