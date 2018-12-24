const PatriciaTree = artifacts.require("PatriciaTree");

const { toHex, keccak256, soliditySha3, toBN } = web3.utils;
const { getStorageAt } = web3.eth;

function commonPrefix(a, b) {
  const length = a.length < b.length ? a.length : b.length;
  if (length === 0) {
    return 0;
  }
  const diff = toBN(a.data).xor(toBN(b.data));
  if (diff.toString(16) === "0") {
    return length;
  }
  let ret;
  for (let i = 255; i >= 0; i -= 1) {
    if (diff.testn(i)) {
      ret = 255 - i;
      break;
    }
  }
  return Math.min(length, ret);
}

function splitAt(label, pos) {
  const prefix = {};
  const suffix = {};
  prefix.length = pos;
  if (pos === 0) {
    prefix.data = toBN(0, 16);
  } else {
    prefix.data = toBN(label.data).and(toBN(0, 16).notn(256).shln(256 - pos));
  }
  suffix.length = label.length - pos;
  suffix.data = toBN(label.data).shln(pos).maskn(256);
  return [prefix, suffix];
}

function insertAtEdge(edge, label, value) {
  const [prefix, suffix] = splitAt(label, commonPrefix(edge.label, label));
  console.log(prefix, suffix);
}

contract('Tree', async () => {
  it('should have correct rootHash', async () => {
    const newPatricia = await PatriciaTree.new();
    let key = toHex("one");
    let value = toHex("ONE");

    let label = {
      data: keccak256(key),
      length: 256
    };
    let valueHash = keccak256(value);

    let edge = {
      label: label,
      node: valueHash
    };

    let rootHash = soliditySha3(edge.node, edge.label.length, edge.label.data);
    await newPatricia.insert(key, value);

    let res = await getStorageAt(newPatricia.address, 0);
    assert.equal(res, rootHash);

    key = toHex("two");
    value = toHex("TWO");

    label = {
      data: keccak256(key),
      length: 256
    };

    valueHash = keccak256(value);

    edge = insertAtEdge(edge, label, valueHash);
  });
});
