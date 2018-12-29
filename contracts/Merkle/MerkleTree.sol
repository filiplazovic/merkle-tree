pragma solidity ^0.5.1;

contract MerkleTree {
  bytes32 rootHash;
  uint256 nNodes;

  bytes32[] edgeNodes;

  event TreeUpdated(bytes32 rootHash, uint256 nNodes, bytes32 firstLevelHash);

  constructor() public {
    edgeNodes.push(0x0);
  }

  // used for testing purposes
  function insert(bytes32 _valueHash, uint256 _saltHash) public {
    bytes32 firstLevelHash = keccak256(abi.encodePacked(_valueHash, _saltHash));
    nNodes += 2;

    bytes32 pairHash = firstLevelHash;
    uint256 nextEdgeLevel = getNextEdgeLevel(nNodes);
    bytes32 newEdge = firstLevelHash;
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

    emit TreeUpdated(rootHash, nNodes, firstLevelHash);
  }

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

  function updateEdges(bytes32 edgeNodeValue) private {
    uint256 previousNNodes = nNodes - 2;

    uint256 numLevels = edgeNodes.length;
    if ((nNodes & (nNodes - 1)) == 0) {
      numLevels += 1;
    }
    for (uint256 i = 1; i < numLevels; i += 1) {
      uint256 levelSq = 2 ** i;

      bool currentContains = (levelSq & nNodes) != 0;
      bool previousContains = (levelSq & previousNNodes) != 0;

      if (i > edgeNodes.length - 1) {
        edgeNodes.push(edgeNodeValue);
      } else if (currentContains && !previousContains) {
        edgeNodes[i] = edgeNodeValue;
      } else if (!currentContains) {
        edgeNodes[i] = 0x0;
      }
    }
  }

  function getNextEdgeLevel(uint256 x) internal pure returns (uint256 _length) {
    uint256 len = 0;
    while((~x & 1) > 0) {
      x = x >> 1;
      len += 1;
    }
    return len;
  }

  function verifyProof(bytes32 _rootHash, bytes32 _valueHash, bytes32[] memory siblings) public pure {
    bytes32 derivedRootHash = _valueHash;
    for (uint256 i = 0; i < siblings.length; i += 1) {
      derivedRootHash = keccak256(abi.encodePacked(derivedRootHash, siblings[i]));
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
