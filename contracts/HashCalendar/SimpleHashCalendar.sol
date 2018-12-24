pragma solidity ^0.5.1;

contract SimpleHashCalendar {
  bytes32 rootHash;
  bytes32[] rootHashes;

  constructor() public {
    rootHashes.push(0x0);
  }

  function insert(bytes32 value) public {
    bytes32 hashValue = keccak256(abi.encodePacked(value));
    rootHash = keccak256(abi.encodePacked(rootHash, hashValue));
    rootHashes.push(rootHash);
  }

  function verifyProof(bytes32 _valueHash, uint256 _pairPos) public view {
    bytes32 rootPair = rootHashes[_pairPos];
    bytes32 valuePair = _valueHash;
    bytes32 targetRootHash = keccak256(abi.encodePacked(rootPair, valuePair));
    require(targetRootHash == rootHashes[_pairPos + uint(1)], "invalid-proof");
  }

  function getRootHash() public view returns (bytes32) {
    return rootHash;
  }
}
