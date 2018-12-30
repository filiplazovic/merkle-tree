pragma solidity ^0.5.1;

contract MerkleTree {
  // Root hash of the tree
  bytes32 rootHash;

  // Number of nodes in the tree
  uint256 nNodes;

  // Hashes of the edge nodes needed for pairing with next insert
  bytes32[] edgeNodes;

  // Event fired when new addition is added. Whole tree can be derived on client from these events
  event TreeUpdated(bytes32 rootHash, uint256 nNodes, bytes32 firstLevelHash);

  constructor() public {
    edgeNodes.push(0x0);
  }

  // Used for testing purposes
  // @notice Inserts 2 new leaf nodes into the tree. All leaf nodes are hidden
  // and can't be derived from this contract.
  // Only the user that is calling this function knows the real values
  // @param _valueHash Hash of the secret value
  // @param _saltHash Hash of the leaf node that is paired with _valueHash
  function insert(bytes32 _valueHash, uint256 _saltHash) public {
    // Make first level branch node by hashing the values passed
    bytes32 firstLevelHash = keccak256(abi.encodePacked(_valueHash, _saltHash));
    // We added 2 nodes
    nNodes += 2;

    // Pair node used for hashing with edge node
    bytes32 pairHash = firstLevelHash;
    // Get the level on which will be the next new edge node
    uint256 nextEdgeLevel = getNextEdgeLevel(nNodes);
    // Hash of the new edge node
    bytes32 newEdge = firstLevelHash;
    // Loop trought all levels of the tree
    for (uint256 i = 1; i < edgeNodes.length; i += 1) {
      // Get the edge node on {i} level
      bytes32 edgeNode = edgeNodes[i];
      if (edgeNode == 0x0) {
        // There is no edge node on this level, hash itself then
        pairHash = keccak256(abi.encodePacked(pairHash));
      } else {
        // There is edge node on this level, make a hash of the pair
        pairHash = keccak256(abi.encodePacked(edgeNode, pairHash));
      }

      if (i + 1 == nextEdgeLevel) {
        // Hash on this level is new edge
        newEdge = pairHash;
      }
    }
    // Update the root hash
    rootHash = pairHash;
    // Update edge nodes
    updateEdges(newEdge);

    // Emit the event so the client can sync with the contract
    emit TreeUpdated(rootHash, nNodes, firstLevelHash);
  }

  // @notice Same as `insert` except that first level hash is calculated before the call. Can only be called internally
  // @param _firstLevelHash Hash of the first level branch node
  function insertFirstLevelHash(bytes32 _firstLevelHash) internal {
    nNodes += 2;

    bytes32 pairHash = _firstLevelHash;
    uint256 nextEdgeLevel = getNextEdgeLevel(nNodes);
    bytes32 newEdge = _firstLevelHash;
    for (uint256 i = 1; i < edgeNodes.length; i += 1) {
      bytes32 edgeNode = edgeNodes[i];
      if (edgeNode == 0x0) {
        pairHash = keccak256(abi.encodePacked(pairHash));
      } else {
        pairHash = keccak256(abi.encodePacked(edgeNode, pairHash));
      }

      if (i + 1 == nextEdgeLevel) {
        newEdge = pairHash;
      }
    }
    rootHash = pairHash;
    updateEdges(newEdge);

    emit TreeUpdated(rootHash, nNodes, _firstLevelHash);
  }

  // @notice Updates the edges for the next insert
  // @param edgeNodeValue Value of the newest edge node
  function updateEdges(bytes32 edgeNodeValue) private {
    // Number of nodes in previous insert
    uint256 previousNNodes = nNodes - 2;

    // Number of levels of the tree
    uint256 numLevels = edgeNodes.length;

    // If nNodes is power of 2, the tree will go up 1 level
    if ((nNodes & (nNodes - 1)) == 0) {
      numLevels += 1;
    }
    for (uint256 i = 1; i < numLevels; i += 1) {
      uint256 numNodesOnLevel = 2 ** i;

      // Figure out where the next edge node will be with bitwise AND
      bool currentContains = (numNodesOnLevel & nNodes) != 0;
      bool previousContains = (numNodesOnLevel & previousNNodes) != 0;

      // if we are on newly created level, push into the array
      if (i > edgeNodes.length - 1) {
        edgeNodes.push(edgeNodeValue);

      // if node wasn't edge in previous insert, but is now
      } else if (currentContains && !previousContains) {
        edgeNodes[i] = edgeNodeValue;

      // if node is not longer an edge node
      } else if (!currentContains) {
        edgeNodes[i] = 0x0;
      }
    }
  }

  // Information about what level the next edge will be on can be extracted from binary representation of current nNodes,
  // by calculating the successive number of 0 bits, starting from the right e.g.:
  // 0010 - 1
  // 0100 - 2
  // 0110 - 1
  // 1000 - 3
  function getNextEdgeLevel(uint256 x) internal pure returns (uint256 _length) {
    uint256 len = 0;
    while((~x & 1) > 0) {
      x = x >> 1;
      len += 1;
    }
    return len;
  }

  // @notice Verify if the given _valueHash is in the tree with root hash of _rootHash
  // @param _rootHash Root hash of the tree
  // @param _valueHash Hash of the value we want to check
  // @param _siblings Hashes of the pairing nodes needed to derive the root hash
  function verifyProof(bytes32 _rootHash, bytes32 _valueHash, bytes32[] memory _siblings) public pure {
    bytes32 derivedRootHash = _valueHash;
    for (uint256 i = 0; i < _siblings.length; i += 1) {
      derivedRootHash = keccak256(abi.encodePacked(derivedRootHash, _siblings[i]));
    }
    require(_rootHash == derivedRootHash, "invalid-proof");
  }

  function getEdgeNodes() public view returns (bytes32[] memory) {
    return edgeNodes;
  }

  function getRootHash() public view returns (bytes32) {
    return rootHash;
  }
}
