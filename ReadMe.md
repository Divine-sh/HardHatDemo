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

   
