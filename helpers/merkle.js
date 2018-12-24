const { keccak256, padRight } = web3.utils;

class MerkleTree {
  constructor() {
    this.rootHash = padRight("0x0", 64);
    this.tree = {};
    this.edgeNodes = {};
    this.nNodes = 1;
  }

  insert(value) {
    const hashedValue = keccak256(value);
    this.tree[value] = hashedValue;

    if (this.nNodes === 1) {
      // H(A)
      this.edgeNodes[0] = hashedValue;

    } else if (this.nNodes === 2) {

      // H(A) + H(B)
      const combined = this.edgeNodes[0] + hashedValue.slice(2);
      // H(H(A) + H(B))
      const combinedHash = keccak256(combined);
      this.tree[combined] = combinedHash;

      this.edgeNodes[0] = null;
      this.edgeNodes[1] = combinedHash;

    } else if (this.nNodes === 3) {

      // H(H(C))
      const hashedHashedValue = keccak256(hashedValue);
      this.tree[hashedValue] = hashedHashedValue;

      // H(H(A) + H(B)) + H(H(C))
      const combined = this.edgeNodes[1] + hashedHashedValue.slice(2);
      // H(H(H(A) + H(B)) + H(H(C)))
      const combinedHash = keccak256(combined);
      this.tree[combined] = combinedHash;

      // H(C)
      this.edgeNodes[0] = hashedValue;
      this.edgeNodes[1] = this.edgeNodes[1];

    } else if (this.nNodes === 4) {

      // H(C) + H(D)
      const combined = this.edgeNodes[0] + hashedValue.slice(2);
      // H(H(C) + H(D))
      const combinedHash = keccak256(combined);
      this.tree[combined] = combinedHash;

      // H(H(A) + H(B)) + H(H(C) + H(D))
      const combinedRoot = this.edgeNodes[1] + combinedHash.slice(2);
      // H(H(H(A) + H(B)) + H(H(C) + H(D)))
      const combinedRootHash = keccak256(combinedRoot);
      this.tree[combinedRoot] = combinedRootHash;

      this.edgeNodes[0] = null;
      this.edgeNodes[1] = null;
      this.edgeNodes[2] = combinedRootHash;

    } else if (this.nNodes === 5) {

      // H(H(E))
      const hashedHashedValue = keccak256(hashedValue);
      this.tree[hashedValue] = hashedHashedValue;

      // H(H(H(E)))
      const hashedHashedHashedValue = keccak256(hashedHashedValue);
      this.tree[hashedHashedValue] = hashedHashedHashedValue;

      // H(H(H(A) + H(B)) + H(H(C) + H(D))) + H(H(H(E)))
      const combined = this.edgeNodes[2] + hashedHashedHashedValue.slice(2);
      // H(H(H(H(A) + H(B)) + H(H(C) + H(D))) + H(H(H(E))))
      const combinedHash = keccak256(combined);
      this.tree[combined] = combinedHash;

      this.edgeNodes[0] = hashedValue;
      this.edgeNodes[1] = null;
      this.edgeNodes[2] = this.edgeNodes[2];

    } else if (this.nNodes === 6) {

      // H(E) + H(F)
      const combined = this.edgeNodes[0] + hashedValue.slice(2);
      // H(H(E) + H(F))
      const combinedHash = keccak256(combined);
      this.tree[combined] = combinedHash;

      // H(H(H(E) + H(F)))
      const combinedHashHash = keccak256(combinedHash);
      this.tree[combinedHash] = combinedHashHash;

      const combinedRoot = this.edgeNodes[2] + combinedHashHash.slice(2);
      const combinedRootHash = keccak256(combinedRoot);
      this.tree[combinedRoot] = combinedRootHash;

      this.edgeNodes[0] = null;
      this.edgeNodes[1] = combinedHash;
      this.edgeNodes[2] = this.edgeNodes[2];

    } else if (this.nNodes === 7) {

      // H(H(G))
      const hashedHashedValue = keccak256(hashedValue);
      this.tree[hashedValue] = hashedHashedValue;

      // H(H(E) + H(F)) + H(H(G))
      const combined = this.edgeNodes[1] + hashedHashedValue.slice(2);
      // H(H(H(E) + H(F)) + H(H(G)))
      const combinedHash = keccak256(combined);
      this.tree[combined] = combinedHash;

      // H(H(H(A) + H(B)) + H(H(C) + H(D))) + H(H(H(E) + H(F)) + H(H(G)))
      const combinedRoot = this.edgeNodes[2] + combinedHash.slice(2);
      // H(H(H(H(A) + H(B)) + H(H(C) + H(D))) + H(H(H(E) + H(F)) + H(H(G))))
      const combinedRootHash = keccak256(combinedRoot);
      this.tree[combinedRoot] = combinedRootHash;

      this.edgeNodes[0] = hashedValue;
      this.edgeNodes[1] = this.edgeNodes[1];
      this.edgeNodes[2] = this.edgeNodes[2];

    } else if (this.nNodes === 8) {

      // H(G) + H(H)
      const combined = this.edgeNodes[0] + hashedValue.slice(2);
      // H(H(G) + H(H))
      const combinedHash = keccak256(combined);
      this.tree[combined] = combinedHash;

      // H(H(E) + H(F)) + H(H(G) + H(H))
      const combined1 = this.edgeNodes[1] + combinedHash.slice(2);
      // H(H(H(E) + H(F)) + H(H(G) + H(H)))
      const combined1Hash = keccak256(combined1);
      this.tree[combined1] = combined1Hash;

      // H(H(H(A) + H(B)) + H(H(C) + H(D))) + H(H(H(E) + H(F)) + H(H(G) + H(H)))
      const combinedRoot = this.edgeNodes[2] + combined1Hash.slice(2);
      // H(H(H(H(A) + H(B)) + H(H(C) + H(D))) + H(H(H(E) + H(F)) + H(H(G) + H(H))))
      const combinedRootHash = keccak256(combinedRoot);
      this.tree[combinedRoot] = combinedRootHash;

      this.edgeNodes[0] = null;
      this.edgeNodes[1] = null;
      this.edgeNodes[2] = null;
      this.edgeNodes[3] = combinedRootHash;

    } else if (this.nNodes === 9) {

      // H(H(I))
      const hashedValue1 = keccak256(hashedValue);
      this.tree[hashedValue] = hashedValue1;

      // H(H(H(I)))
      const hashedValue2 = keccak256(hashedValue1);
      this.tree[hashedValue1] = hashedValue2;

      // H(H(H(H(I))))
      const hashedValue3 = keccak256(hashedValue2);
      this.tree[hashedValue2] = hashedValue3;

      const combinedRoot = this.edgeNodes[3] + hashedValue3.slice(2);
      const combinedRootHash = keccak256(combinedRoot);
      this.tree[combinedRoot] = combinedRoot;

      this.edgeNodes[0] = hashedValue;
      this.edgeNodes[1] = null;
      this.edgeNodes[2] = null;
      this.edgeNodes[3] = this.edgeNodes[3];

    }
  }

  addFirstValue(value) {
    // H(A)
    const hashedValue = keccak256(value);
    this.tree[value] = hashedValue;

    // H(A)
    this.edgeNodes[0] = hashedValue;
  }

  addSecondValue(value) {
    // H(B)
    const hashedValue = keccak256(value);
    this.tree[value] = hashedValue;

    // H(A) + H(B)
    const combined = this.edgeNodes[0] + hashedValue.slice(2);
    // H(H(A) + H(B))
    const combinedHash = keccak256(combined);
    this.tree[combined] = combinedHash;

    this.edgeNodes[0] = null;

    // H(H(A) + H(B))
    this.edgeNodes[1] = combinedHash;
  }

  addThirdValue(value) {
    // H(C)
    const hashedValue = keccak256(value);
    this.tree[value] = hashedValue;

    // H(H(C))
    const hashedHashedValue = keccak256(hashedValue);
    this.tree[hashedValue] = hashedHashedValue;

    // H(H(A) + H(B)) + H(H(C))
    const combined = this.edgeNodes[1] + hashedHashedValue.slice(2);
    // H(H(H(A) + H(B)) + H(H(C)))
    const combinedHash = keccak256(combined);
    this.tree[combined] = combinedHash;

    // H(C)
    this.edgeNodes[0] = hashedValue;
  }

  addForthValue(value) {
    // H(D)
    const hashedValue = keccak256(value);
    this.tree[value] = hashedValue;

    // H(C) + H(D)
    const combined = this.edgeNodes[0] + hashedValue.slice(2);
    // H(H(C) + H(D))
    const combinedHash = keccak256(combined);
    this.tree[combined] = combinedHash;

    // H(H(A) + H(B)) + H(H(C) + H(D))
    const combinedRoot = this.edgeNodes[1] + combinedHash.slice(2);
    // H(H(H(A) + H(B)) + H(H(C) + H(D)))
    const combinedRootHash = keccak256(combinedRoot);
    this.tree[combinedRoot] = combinedRootHash;

    this.edgeNodes[0] = null;
    this.edgeNodes[1] = null;
    this.edgeNodes[2] = combinedRootHash;
  }

  addFifthValue(value) {
    // H(E)
    const hashedValue = keccak256(value);
    this.tree[value] = hashedValue;

    // H(H(E))
    const hashedHashedValue = keccak256(hashedValue);
    this.tree[hashedValue] = hashedHashedValue;

    // H(H(H(E)))
    const hashedHashedHashedValue = keccak256(hashedHashedValue);
    this.tree[hashedHashedValue] = hashedHashedHashedValue;

    // H(H(H(A) + H(B)) + H(H(C) + H(D))) + H(H(H(E)))
    const combined = this.edgeNodes[2] + hashedHashedHashedValue.slice(2);
    // H(H(H(H(A) + H(B)) + H(H(C) + H(D))) + H(H(H(E))))
    const combinedHash = keccak256(combined);
    this.tree[combined] = combinedHash;

    this.edgeNodes[0] = hashedValue;
  }

  addSixthValue(value) {
    // H(F)
    const hashedValue = keccak256(value);
    this.tree[value] = hashedValue;

    // H(E) + H(F)
    const combined = this.edgeNodes[0] + hashedValue.slice(2);
    // H(H(E) + H(F))
    const combinedHash = keccak256(combined);
    this.tree[combined] = combinedHash;

    // H(H(H(E) + H(F)))
    const combinedHashHash = keccak256(combinedHash);
    this.tree[combinedHash] = combinedHashHash;

    const combinedRoot = this.edgeNodes[2] + combinedHashHash.slice(2);
    const combinedRootHash = keccak256(combinedRoot);
    this.tree[combinedRoot] = combinedRootHash;

    this.edgeNodes[0] = null;
    this.edgeNodes[1] = combinedHash;
  }

  addSeventhValue(value) {
    // H(G)
    const hashedValue = keccak256(value);
    this.tree[value] = hashedValue;

    // H(H(G))
    const hashedHashedValue = keccak256(hashedValue);
    this.tree[hashedValue] = hashedHashedValue;

    // H(H(E) + H(F)) + H(H(G))
    const combined = this.edgeNodes[1] + hashedHashedValue.slice(2);
    // H(H(H(E) + H(F)) + H(H(G)))
    const combinedHash = keccak256(combined);
    this.tree[combined] = combinedHash;

    // H(H(H(A) + H(B)) + H(H(C) + H(D))) + H(H(H(E) + H(F)) + H(H(G)))
    const combinedRoot = this.edgeNodes[2] + combinedHash.slice(2);
    // H(H(H(H(A) + H(B)) + H(H(C) + H(D))) + H(H(H(E) + H(F)) + H(H(G))))
    const combinedRootHash = keccak256(combinedRoot);
    this.tree[combinedRoot] = combinedRootHash;

    this.edgeNodes[0] = hashedValue;
  }

  addEightValue(value) {
    // H(H)
    const hashedValue = keccak256(value);
    this.tree[value] = hashedValue;

    // H(G) + H(H)
    const combined = this.edgeNodes[0] + hashedValue.slice(2);
    // H(H(G) + H(H))
    const combinedHash = keccak256(combined);
    this.tree[combined] = combinedHash;

    // H(H(E) + H(F)) + H(H(G) + H(H))
    const combined1 = this.edgeNodes[1] + combinedHash.slice(2);
    // H(H(H(E) + H(F)) + H(H(G) + H(H)))
    const combined1Hash = keccak256(combined1);
    this.tree[combined1] = combined1Hash;

    // H(H(H(A) + H(B)) + H(H(C) + H(D))) + H(H(H(E) + H(F)) + H(H(G) + H(H)))
    const combinedRoot = this.edgeNodes[2] + combined1Hash.slice(2);
    // H(H(H(H(A) + H(B)) + H(H(C) + H(D))) + H(H(H(E) + H(F)) + H(H(G) + H(H))))
    const combinedRootHash = keccak256(combinedRoot);
    this.tree[combinedRoot] = combinedRootHash;

    this.edgeNodes[0] = null;
    this.edgeNodes[1] = null;
    this.edgeNodes[2] = null;
    this.edgeNodes[3] = combinedRootHash;
  }

  addNinthValue(value) {
    // H(I)
    const hashedValue = keccak256(value);
    this.tree[value] = hashedValue;

    // H(H(I))
    const hashedValue1 = keccak256(hashedValue);
    this.tree[hashedValue] = hashedValue1;

    // H(H(H(I)))
    const hashedValue2 = keccak256(hashedValue1);
    this.tree[hashedValue1] = hashedValue2;

    // H(H(H(H(I))))
    const hashedValue3 = keccak256(hashedValue2);
    this.tree[hashedValue2] = hashedValue3;

    const combinedRoot = this.edgeNodes[3] + hashedValue3.slice(2);
    const combinedRootHash = keccak256(combinedRoot);
    this.tree[combinedRoot] = combinedRoot;

    this.edgeNodes[0] = hashedValue;
  }
}

module.exports = MerkleTree;
