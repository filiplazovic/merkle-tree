const SimpleHashCalendar = artifacts.require("SimpleHashCalendar");
const { toHex, soliditySha3, keccak256, padRight, toBN } = web3.utils;

contract("SimpleHashCalendar", () => {
  it("should be able to set new root hash", async () => {
    const calendar = await SimpleHashCalendar.new();
    let value = toHex("a");
    await calendar.insert(value);
    let rootHash = await calendar.getRootHash();
    assert.equal(rootHash, soliditySha3(padRight("0x0", 64), keccak256(padRight(value, 64))));
  });

  it("should be able to verify proof", async () => {
    const calendar = await SimpleHashCalendar.new();
    let value = toHex("a");
    await calendar.insert(value);
    await calendar.verifyProof(value, 1);

    value = toHex("b");
    await calendar.insert(value);
    await calendar.verifyProof(value, 2);
  });
});
