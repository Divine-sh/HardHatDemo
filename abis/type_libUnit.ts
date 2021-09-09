type libUnit = {
    lpAdd: string,
    deposGas: number, //抵押eth的gas
    transGas: number, //传送token到lp的gas
    swapGas: number, //在lp上交换的gas
    totalGas: number, //传送加交换的gas
    default: string
}
export {libUnit};