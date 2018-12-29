const { soliditySha3, padRight, toHex } = web3.utils;
const assert = require('assert');

class MerkleTree {
  constructor(contractInstance) {
    this.tree = {};
    this.rootHash = padRight("0x0", 64);
    this.contract = contractInstance;
  }

  async insert(value, salt, insertOnChain = false) {
    const valueHash = soliditySha3(padRight(toHex(value), 64));
    const saltHash = soliditySha3(salt);

    if (insertOnChain) {
      await this.contract.insert(valueHash, saltHash);
    }

    const parentHash = soliditySha3(valueHash, saltHash);
    this.tree[parentHash] = {
      children: [valueHash, saltHash]
    }

    this.tree[valueHash] = {
      parent: parentHash,
      sibling: saltHash,
      isLeaf: true
    }

    this.tree[saltHash] = {
      parent: parentHash,
      sibling: valueHash
    }
  }

  getProof(rootHash, value) {
    assert(this.tree[rootHash] !== undefined, "Root hash doesn't exist or client not fully synced, try calling 'sync' first");
    const valueHash = soliditySha3(padRight(toHex(value), 64));

    assert(this.tree[valueHash] !== undefined, `Value: ${value} not found in tree`);

    const proof = [];
    const node = this.tree[valueHash];

    assert(node.isLeaf !== undefined, `Node with value: ${value} is not a leaf node`);

    proof.push(node.sibling);
    let parentHash = node.parent;

    if (parentHash == rootHash) {
      return proof;
    }

    while (true) {
      const parentSiblingHash = this.tree[parentHash].sibling;
      proof.push(parentSiblingHash);
      assert(this.tree[parentHash] !== undefined, "Proof not found");

      if (this.tree[parentHash].parent === rootHash) {
        // Proof is completed
        break;
      }
      parentHash = this.tree[parentHash].parent;
    }

    return proof;
  }

  async sync() {
    const coinbase = await web3.eth.getCoinbase();
    const web3ContractInstance = new web3.eth.Contract(this.contract.abi, this.contract.address);
    await web3ContractInstance.getPastEvents("TreeUpdated", {
      fromBlock: 0,
      toBlock: 'latest'
    })
    .then(events => this.buildTreeFromEventLogs(events));
  }

  buildTreeFromEventLogs(events) {
    let edgeNodes = [null];
    for (var i = 0; i < events.length; i += 1) {
      const node = events[i].returnValues;
      const nNodes = node.nNodes;

      let valueHash = node.firstLevelHash;
      let newEdge = valueHash;
      const nextEdgeLevel = this.getNextEdgeLevel(nNodes);
      for (let i = 1; i < edgeNodes.length; i += 1) {
        const edgeNode = edgeNodes[i];
        if (!edgeNode) {
          const selfHash = soliditySha3(valueHash);

          this.tree[selfHash] = {
            children: [valueHash],
          };

          this.tree[valueHash] = {
            ...this.tree[valueHash],
            parent: selfHash
          };

          valueHash = selfHash;
        } else {
          const combinedHash = soliditySha3(edgeNode, valueHash);

          this.tree[combinedHash] = {
            children: [edgeNode, valueHash],
          };

          this.tree[edgeNode] = {
            ...this.tree[edgeNode],
            parent: combinedHash,
            sibling: valueHash
          };

          this.tree[valueHash] = {
            ...this.tree[valueHash],
            parent: combinedHash,
            sibling: edgeNode
          };

          valueHash = combinedHash;
        }

        if (i + 1 == nextEdgeLevel) {
          newEdge = valueHash;
        }
      }
      this.rootHash = valueHash;

      this.updateEdges(newEdge, nNodes, edgeNodes);
    }
  }

  updateEdges(edgeNodeValue, nNodes, edgeNodes) {
    const nextNNodes = nNodes;
    const currentNNodes = nNodes - 2;

    let numLevels = edgeNodes.length;
    if ((nNodes & (nNodes - 1)) == 0) {
      numLevels += 1;
    }
    for (let i = 1; i < numLevels; i += 1) {
      const levelSq = 2 ** i;

      const nextContains = (levelSq & nextNNodes) != 0;
      const currentContains = (levelSq & currentNNodes) != 0;

      if (i > edgeNodes.length - 1) {
        edgeNodes.push(edgeNodeValue);
      } else if (nextContains && !currentContains) {
        edgeNodes[i] = edgeNodeValue;
      } else if (!nextContains) {
        edgeNodes[i] = null;
      }
    }
  }

  getNextEdgeLevel(x) {
    let len = 0;
    while((~x & 1) > 0) {
      x = x >> 1;
      len++;
    }
    return len;
  }
}

module.exports = MerkleTree;
