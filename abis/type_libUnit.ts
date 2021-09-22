type libUnit = {
    lpAdd: string,
    token0: string,
    token1: string,
    swapGas0t1: number, //在lp上进行token0到token1的交换的gas
    swapGas1t0: number, //在lp上进行token0到token1的交换的gas
    default: string
}
export {libUnit};