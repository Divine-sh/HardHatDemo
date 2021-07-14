// import { ethers} from 'hardhat';
import { IUniswapV2Pair } from '@typechains/IUniswapV2Pair';
import { IUniswapV2Factory } from '@typechains/IUniswapV2Factory';
import { ethers } from 'hardhat';


export async function getIUniswapV2Pair(address:string): Promise<IUniswapV2Pair>{
  const LP_FACTORY = (await ethers.getContractAt('IUniswapV2Pair',address)) as IUniswapV2Pair;
  let LP = LP_FACTORY.attach(address) as IUniswapV2Pair;
  return LP
}
export async function getIUniswapFactory(factory_address:string): Promise<IUniswapV2Factory>{
  const UNI_FACTORY_FACTORY = (await  ethers.getContractAt('IUniswapV2Factory', factory_address)) as IUniswapV2Factory;
  let uni_factory = UNI_FACTORY_FACTORY.attach(factory_address) as IUniswapV2Factory;
  return uni_factory;
}


//合约充钱

export default {
  getIUniswapFactory,
  getIUniswapV2Pair
}