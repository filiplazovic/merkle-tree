const MerkleTree = require("../helpers/merkle");
const { toHex, soliditySha3, keccak256, padRight, toBN } = web3.utils;

contract.only("Merkle", () => {
  it("should", async () => {
    const merkle = new MerkleTree();
    merkle.addFirstValue("a");
    merkle.addSecondValue("b");
    merkle.addThirdValue("c");
    merkle.addForthValue("d");
    merkle.addFifthValue("e");
    merkle.addSixthValue("f");
    merkle.addSeventhValue("g");
    merkle.addEightValue("h");
    merkle.addNinthValue("i");


    console.log(merkle.tree);
    console.log(merkle.edgeNodes);
  });
});
