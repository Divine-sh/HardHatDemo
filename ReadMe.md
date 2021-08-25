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
ETH_RPC=http://172.17.31.165:3335
ETH_RPC=http://172.17.31.104:3335

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