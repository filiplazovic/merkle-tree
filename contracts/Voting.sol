pragma solidity ^0.5.1;

import "./TokenLocking/TokenLockingWithCount.sol";
import "./Merkle/MerkleTree.sol";

contract Voting is TokenLockingWithCount, MerkleTree {
    uint256 voteDeadline;
    uint256 revealPeriod;
    bytes32[] voteOptions;
    mapping(bytes32 => uint256) voteCount;
    mapping(bytes32 => bool) secrets;

    modifier voteNotStarted() {
      require(voteDeadline == 0, "vote-already-started");
      _;
    }

    modifier voteRunning() {
      require(block.timestamp < voteDeadline, "vote-not-running");
      _;
    }

    modifier voteFinished() {
      require(block.timestamp >= voteDeadline, "vote-not-finished");
      _;
    }

    modifier isRevealPeriod() {
      require(voteDeadline + revealPeriod > block.timestamp, "not-in-reveal-period");
      _;
    }

    function addOption(bytes32 _description) public voteNotStarted {
      // TODO make sure we cant add 2 same options
      voteOptions.push(_description);
    }

    function startVote(uint256 _deadline, uint256 _revealPeriod) public voteNotStarted {
      require(voteOptions.length > 1, "invalid-number-of-options");
      voteDeadline = _deadline;
      revealPeriod = _revealPeriod;
      lockAllDeposits();
    }

    function submitSecret(bytes32 _value, uint256 _salt) public voteRunning {
      require(isUserEligable(msg.sender), "user-not-eligable");
      insert(_value, _salt);
    }

    function revealSecret(bytes32 _option, bytes32 _rootHash, bytes32 _valueHash, bytes32[] memory _siblings) public isRevealPeriod {
      verifyProof(_rootHash, _valueHash, _siblings);
      voteCount[_option] += 1;
      unlockUserDeposit(msg.sender);
    }

    function getNumberOfVotesFor(uint256 _optionIndex) public view returns (uint256) {
      return voteCount[voteOptions[_optionIndex]];
    }
}
