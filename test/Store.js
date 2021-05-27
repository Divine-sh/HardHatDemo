const { expect } = require("chai");

describe("Sotre contract", function() {
    let Token;
    let hardhatToken;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        // const [owner] = await ethers.getSigners();

        Token = await ethers.getContractFactory("Storage");

        hardhatToken = await Token.deploy(_number=500);

    });
    it("Normal ", async function() {


        let value = await hardhatToken.retrieve();
        console.log(value)
        console.log(eval(value).toString())
        const set_value = 7000
        await hardhatToken.store(set_value)

        value = await hardhatToken.retrieve();
        console.log(value)
        console.log(eval(value).toString())

        expect(eval(value).toString()).to.equal(set_value.toString());

    });

    it("Error Met", async function() {
        const value = await hardhatToken.retrieve();
        console.log(value)
        console.log(eval(value).toString())

        await hardhatToken.store(200)
    });
});