import { task, HardhatUserConfig } from 'hardhat/config';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-waffle';
import { ethers } from 'ethers';

require('dotenv').config()

const pkey:string = process.env.PRIVATE_KEY || "6a5508b9ca8a09217789fc9d2b37688093d2b72eb450fcb6bf5e9b080a112112" //fake one
const ETH_RPC = process.env.ETH_RPC||"http://172.17.31.165:3335" //office run time defuatl

const newWallet = ethers.Wallet.createRandom();

const config: HardhatUserConfig = {
  solidity: { version: '0.7.6' },
  networks: {
    hardhat: {
      // loggingEnabled: true,
      forking: {
        url: ETH_RPC,
        blockNumber: 13080988,
        enabled: true,
      },
      accounts: [
        {
          privateKey:`0x${pkey}`,
          balance:'1000000000000000000000000'
        },
        {
          'privateKey': newWallet.privateKey,
          balance:'20000000000000000000'
        }
      ],
      hardfork: "london",
      gasPrice: Math.pow(10,11),
      chainId:31337
    },
    ETH:{
      url: ETH_RPC,
      chainId: 1,
      accounts: [`0x${pkey}`],
    },
  },
  mocha: {
    timeout: 160000,
  },
};

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = config;
