# 使用说明


# 环境
node: 12.16.1

npm: 6.13.4

# 安装依赖
`npm i` 

注意: 不要用国内源,最好开着VPN, 直接 npm i

# 配置
在项目根目录新建 .env 文件

里面填写 ETH_RPC, 例如
```
ETH_RPC=http://39.105.105.233:3335

```
# 单元测试范例

## storeage
```
npx hardhat compile
npm run test test/StorageTest.ts

```
## token 范例

部署本机合约,并读取状态
```
npm run test test/TokenTest.ts 
```

## storage 范例
部署一个简单的存储合约, 变更合约状态,并读取

```
 npm run test test/StorageTest.ts
```

## uniswap 范例
和链上现有合约交互,功能点:
1. 根据 token 对, WETH 和 USDC 获得LP
2. 调用LP的getReserve 函数

```
npm run test test/UniswapTest.ts
```


# Uniswap: Swap tokens in 3 steps

## Demo 作用

 	hardhat 环境下拥有 ETH 的用户 signer 通过将 WETH 兑换为 UNI ，再兑换为 USDC ，并将 USDC 转至目标用户。

## 相关概念

- **LP （ Liquidity Provider ）** : 流动资金提供者，类比银行
- **signer** : 通过 hardhat 环境的第一个账户
- **target user ( targetAddress / myETHAddress )** : 目标账户/待转入/接收的账户(合约)
- **ERC20 tokens**: WETH, UNI, USDC

## 步骤

1. **抵押/存款（deposit） -> transfer**

  ```typescript
  await wethContract.connect(signer).deposit({ value: buyAmount });
  await wethContract.connect(signer).transfer(lpAddress, buyAmount);
  ```

  

2. **swap: WETH -> UNI**

  ```typescript
  await lpContract.connect(signer).swap(outAmount, 0, newLpAddress, []);
  ```

  

3. **swap: UNI -> USDC -> myETHAddress**

   ```typescript
   await newLpContract.connect(signer).swap(0, outAmount, myETHAddress, [])
   ```


# Uniswap: Gas Estimate

### 一般交易步骤：

##### 从自己的账户将weth transfer到lp，可能涉及多个token，中间lp通过swap，最后swap回到自己的账户，实现套利.

> 例如: 一笔交易涉及到WETH、token1、token2三种代币

交易流程一般为:
①**WETH**转到**WETH/TOKEN1 LP**
②在**WETH/token1 LP**将 **WETH** 换成 **token1**
    **换出的token1**直接转出到**token1/token2 LP**
③在**WETH/token2 LP**将 **token1** 换成 **token2**
    **换出的token2**直接转出回**原账户**

> 所以整个过程涉及到了WETH的transfer，LP1的swap和LP2的swap

#### 注意：

1.在本地运行，每调用一次合约函数就需要一次call，但是以太坊上只需要一次；

2.在本地运行，每调用一次合约函数还需要inputdata*16

swap函数：inputdata === 330

transfer函数：inputdata === 138



### 待改动

1.数据结构：统计lp的token0和token1,统计从token0转1和token1转0两个方向的swapGas（重新跑数据）

2.函数参数：新加tokenList，表明token转换的顺序过程

3.transfer的gas基本一致，统一定为29694
