const MerkleTreeClient = require("../client/merkle");
const MerkleTree = artifacts.require("MerkleTree");
const { toHex, soliditySha3, keccak256, padRight, toBN } = web3.utils;

const solidityZeroBytes32 = padRight("0x0", 64);

contract("Merkle Tree", () => {
  it("should correctly calculate edge nodes and root hash in on-chain tree", async () => {
    const a = keccak256(padRight(toHex("a"), 64));
    const b = soliditySha3(4);
    const ab = soliditySha3(a, b);

    const c = soliditySha3(padRight(toHex("c"), 64));
    const d = soliditySha3(7);
    const cd = soliditySha3(c, d);

    const abcd = soliditySha3(ab, cd);

    const e = soliditySha3(padRight(toHex("e"), 64));
    const f = soliditySha3(8);
    const ef = soliditySha3(e, f);
    const ef1 = soliditySha3(ef);

    const abcdef = soliditySha3(abcd, ef1);

    const g = soliditySha3(padRight(toHex("g"), 64));
    const h = soliditySha3(9);
    const gh = soliditySha3(g, h);

    const efgh = soliditySha3(ef, gh);
    const abcdefgh = soliditySha3(abcd, efgh);

    const i = soliditySha3(padRight(toHex("i"), 64));
    const j = soliditySha3(10);
    const ij = soliditySha3(i, j);
    const ij1 = soliditySha3(ij);
    const ij2 = soliditySha3(ij1);

    abcdefghij2 = soliditySha3(abcdefgh, ij2);

    const k = soliditySha3(padRight(toHex("k"), 64));
    const l = soliditySha3(11);
    const kl = soliditySha3(k, l);

    const ijkl = soliditySha3(ij, kl);
    const ijkl1 = soliditySha3(ijkl);

    const abcdefghijkl1 = soliditySha3(abcdefgh, ijkl1);

    const merkleTree = await MerkleTree.new();

    let tx = await merkleTree.insert(toHex("a"), 4);
    let firstLevelHash = tx.logs[0].args.firstLevelHash;
    let realRootHash = await merkleTree.getRootHash();
    let edgeNodes = await merkleTree.getEdgeNodes();

    assert.equal(firstLevelHash, ab, "First level hash is not correct after inserts: a, b");
    assert.equal(realRootHash, ab, "Root hash is not correct after inserts: a, b");
    assert.deepEqual(edgeNodes, [solidityZeroBytes32, ab]);

    tx = await merkleTree.insert(toHex("c"), 7);
    firstLevelHash = tx.logs[0].args.firstLevelHash;
    realRootHash = await merkleTree.getRootHash();
    edgeNodes = await merkleTree.getEdgeNodes();

    assert.equal(firstLevelHash, cd, "First level hash is not correct after inserts: c, d");
    assert.equal(realRootHash, abcd, "Root hash is not correct after inserts: c, d");
    assert.deepEqual(edgeNodes, [solidityZeroBytes32, solidityZeroBytes32, abcd]);

    tx = await merkleTree.insert(toHex("e"), 8);
    firstLevelHash = tx.logs[0].args.firstLevelHash;
    realRootHash = await merkleTree.getRootHash();
    edgeNodes = await merkleTree.getEdgeNodes();

    assert.equal(firstLevelHash, ef, "First level hash is not correct after inserts: e, f");
    assert.equal(realRootHash, abcdef, "Root hash is not correct after inserts: e, f");
    assert.deepEqual(edgeNodes, [solidityZeroBytes32, ef, abcd]);

    tx = await merkleTree.insert(toHex("g"), 9);
    firstLevelHash = tx.logs[0].args.firstLevelHash;
    realRootHash = await merkleTree.getRootHash();
    edgeNodes = await merkleTree.getEdgeNodes();

    assert.equal(firstLevelHash, gh, "First level hash is not correct after inserts: g, h");
    assert.equal(realRootHash, abcdefgh, "Root hash is not correct after inserts: g, h");
    assert.deepEqual(edgeNodes, [solidityZeroBytes32, solidityZeroBytes32, solidityZeroBytes32, abcdefgh]);

    tx = await merkleTree.insert(toHex("i"), 10);
    firstLevelHash = tx.logs[0].args.firstLevelHash;
    realRootHash = await merkleTree.getRootHash();
    edgeNodes = await merkleTree.getEdgeNodes();

    assert.equal(firstLevelHash, ij, "First level hash is not correct after inserts: i, j");
    assert.equal(realRootHash, abcdefghij2, "Root hash is not correct after inserts: i, j");
    assert.deepEqual(edgeNodes, [solidityZeroBytes32, ij, solidityZeroBytes32, abcdefgh]);

    tx = await merkleTree.insert(toHex("k"), 11);
    firstLevelHash = tx.logs[0].args.firstLevelHash;
    realRootHash = await merkleTree.getRootHash();
    edgeNodes = await merkleTree.getEdgeNodes();

    assert.equal(firstLevelHash, kl, "First level hash is not correct after inserts: k, l");
    assert.equal(realRootHash, abcdefghijkl1, "Root hash is not correct after inserts: k, l");
    assert.deepEqual(edgeNodes, [solidityZeroBytes32, solidityZeroBytes32, ijkl, abcdefgh]);
  });

  it("client should be in sync with on-chain tree", async () => {
    const merkleTree = await MerkleTree.new();
    const merkleTreeClient = new MerkleTreeClient(merkleTree);

    const a = keccak256(padRight(toHex("a"), 64));
    const b = soliditySha3(4);
    const ab = soliditySha3(a, b);

    const c = soliditySha3(padRight(toHex("c"), 64));
    const d = soliditySha3(7);
    const cd = soliditySha3(c, d);

    const abcd = soliditySha3(ab, cd);

    await merkleTreeClient.insert("a", 4);
    await merkleTreeClient.insert("c", 7);
    await merkleTreeClient.sync();

    const realRootHash = await merkleTree.getRootHash();
    assert.equal(realRootHash, merkleTreeClient.rootHash, "Root hashes are not equal")
  });

  it("should be able to create valid proof", async () => {
    const merkleTree = await MerkleTree.new();
    const merkleTreeClient = new MerkleTreeClient(merkleTree);

    const a = keccak256(padRight(toHex("a"), 64));
    const b = soliditySha3(4);
    const ab = soliditySha3(a, b);

    const c = soliditySha3(padRight(toHex("c"), 64));
    const d = soliditySha3(7);
    const cd = soliditySha3(c, d);

    const abcd = soliditySha3(ab, cd);

    await merkleTreeClient.insert("a", 4);
    await merkleTreeClient.insert("c", 7);
    await merkleTreeClient.sync();

    const realRootHash = await merkleTree.getRootHash();

    const siblings = merkleTreeClient.getProof(realRootHash, "a");
    await merkleTree.verifyProof(realRootHash, toHex("a"), siblings);
  })
});
