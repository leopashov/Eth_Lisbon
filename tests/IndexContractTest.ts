import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { IndexContract } from '../typechain-types/contracts/IndexContract.sol'; // import other contract for local deployment 
import { IndexToken } from '../typechain-types/contracts'; // import other contract for local deployment 


describe("IndexContract", function () {
    let tokenContract: IndexToken;
    let indexContract: IndexContract;
    let deployer: SignerWithAddress;
    let acc1: SignerWithAddress;
    let acc2: SignerWithAddress;
    let token1: SignerWithAddress;
    let token2: SignerWithAddress;
    let token3: SignerWithAddress;
    let atoken1: SignerWithAddress;
    let atoken2: SignerWithAddress;
    let atoken3: SignerWithAddress;

    beforeEach(async () => {
        [deployer, acc1, acc2, token1, token2, token3, atoken1, atoken2, atoken3] = await ethers.getSigners();

        // get contract  
        const tokenContractFacory = await ethers.getContractFactory('IndexToken');
        const indexContractFactory = await ethers.getContractFactory('IndexContract');

        // deploy contract 
        /// token contract 
        tokenContract = await tokenContractFacory.deploy();
        await tokenContract.deployed();
        console.log("tokenContract deployed!");
        console.log((await ethers.provider.getBlock("latest")).timestamp);

        /// deploy indexContract 
        indexContract = await indexContractFactory.deploy(
            tokenContract.address,
            [atoken1.address,atoken2.address,atoken3.address]
        );
        await indexContract.deployed();
        console.log("indexContract deployed!");
        console.log((await ethers.provider.getBlock("latest")).timestamp);

        // assign minter role
        const MINTER_ROLE = await tokenContract.MINTER_ROLE();
        const grantRoleTx = await tokenContract.grantRole(
            MINTER_ROLE,
            indexContract.address
        );
        await grantRoleTx.wait();
        console.log("Minter role granted!");
        console.log((await ethers.provider.getBlock("latest")).timestamp);
    });


    describe("When the first user funds the IndexContract.sol", async () => {

        it("we expect an increases the eth balance of the contract and non-reverting of the contract", async () => {

            const initialEthBalance = await ethers.provider.getBalance(indexContract.address);
            console.log(initialEthBalance);

            const fundTx = await indexContract.connect(deployer).receive_funds({ "value": ethers.utils.parseEther("1") });
            await fundTx.wait();
            console.log(fundTx.hash);

            const finalEthBalance = await ethers.provider.getBalance(indexContract.address);
            expect(finalEthBalance).to.not.eq(initialEthBalance);
            console.log("Successfully funded contract");

        });

        it("must be funded with more than 0.1 eth", async () => {
            var error = await indexContract.connect(acc1).receive_funds({ "value": ethers.utils.parseEther("0.01"), });
            expect(error).to.be.an('error');
        
            // ref.: https://www.chaijs.com/api/bdd/

            //NOTE: function behaves as expected but I cannot find the right was to make 
            // the expect function work
        });

        it("mints the correct number of tokens",async () => {
            const initialUserIndexTokenBalance = await tokenContract.balanceOf(acc1.address);
            const tx = await indexContract.connect(acc1).receive_funds({ "value": ethers.utils.parseEther("0.11"), });
            await tx.wait();
            const finalUserIndexTokenBalanceBN = await tokenContract.balanceOf(acc1.address);
            console.log(finalUserIndexTokenBalanceBN);
            const finalUserIndexTokenBalance = ethers.utils.formatEther(String(finalUserIndexTokenBalanceBN));
            const expectedBalance = initialUserIndexTokenBalance.add(ethers.utils.parseEther("1"));
            expect(expectedBalance).to.eq(finalUserIndexTokenBalanceBN);
        });

    describe("When more users fund the IndexContract.sol", async () => {
        
        beforeEach(async () => {
            // prefund contract with some (1) eth
            const fundTx = await indexContract.connect(acc1).receive_funds({ "value": ethers.utils.parseEther(String(Math.random())), });
        });

        it("increases indexValue by amount of eth received", async () => {
            const initialIndexValue = Number(tokenContract.indexValue);
            console.log(`initial index value ${initialIndexValue}`);
            const acc2Deposit = 10 * Math.random();
            console.log(acc2Deposit);
            const tx = await indexContract.connect(acc2).receive_funds({ "value": ethers.utils.parseEther(String(acc2Deposit)), });
            await tx.wait();
            const finalIndexValue = await tokenContract.indexValue;
            const expectedValue = initialIndexValue + acc2Deposit;
            expect(finalIndexValue).to.eq(expectedValue);


        })

        it("mints the correct number of tokens",async () => {
            const initialUserIndexTokenBalance = await tokenContract.balanceOf(acc2.address);
            // use other account aswell
            const acc2Deposit = 10 * Math.random();
            console.log(acc2Deposit);
            const tx = await indexContract.connect(acc2).receive_funds({ "value": ethers.utils.parseEther(String(acc2Deposit)), });
            await tx.wait();
            const finalUserIndexTokenBalance = await tokenContract.balanceOf(acc2.address);
            // const finalUserIndexTokenBalance = ethers.utils.formatEther(String(finalUserIndexTokenBalanceBN));
            console.log(finalUserIndexTokenBalance);
            const expectedBalance = initialUserIndexTokenBalance.add(ethers.utils.parseEther("1"));
            expect(expectedBalance).to.eq(finalUserIndexTokenBalance);
        });

    describe("when 'Balance Fund' function is called", () => {
        this.beforeEach(async () => {
            
        })

        it("calculates vault token price in eth", () => {
            expect(indexContract.calculateVaultTokenPriceInEth(atoken1));
        })

        it("has initial vault token dummy values", () => {
            expect(indexContract._vaultTokens).to.not.eq(null);
        })

        it("updates token proportions", () => {
            throw new Error("not implemented");
        })
    })
});


    // describe("When the owner withdraws from the contract", () => {}

    //     it("recovers the right amount of ERC20 tokens", () => {
    //         throw new Error("Not implemented");
    //     });

    //     it("updates the owner account correctly", () => {
    //         throw new Error("Not implemented");
    //     });

    // });
})})
