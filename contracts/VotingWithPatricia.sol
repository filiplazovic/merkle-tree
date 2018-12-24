pragma solidity ^0.5.1;

import "./VotingBase.sol";
import "./Patricia/Patricia.sol";

contract VotingWithPatricia is VotingBase, PatriciaTree {
  function submitSecret(bytes memory _key, bytes memory _value) public voteRunning {
    require(isUserEligable(msg.sender), "user-not-eligable");
    insert(_key, _value);
    unlockUserDeposit(msg.sender);
  }

  function revealSecret(bytes32 _option, bytes32 _rootHash, bytes memory _key, bytes32 _secretHash, uint256 _branchMask, bytes32[] memory _siblings) public voteFinished {
    require(!secrets[_secretHash], "secret-already-revealed");
    verifyZeroKnowledgeProof(_rootHash, _key, _secretHash, _branchMask, _siblings);
    secrets[_secretHash] = true;
    voteCount[_option] += 1;
  }
}
