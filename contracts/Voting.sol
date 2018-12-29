pragma solidity ^0.5.1;

import "./TokenLocking/TokenLockingWithTimestamp.sol";
import "./Merkle/MerkleTree.sol";

contract Voting is TokenLockingWithTimestamp, MerkleTree {
    uint256 voteDeadline;
    uint256 revealPeriod;
    uint256 numOptions;
    mapping(uint256 => uint256) voteCount;

    modifier voteNotStarted() {
      require(voteDeadline == 0, "vote-already-started");
      _;
    }

    modifier validOption(uint256 _optionIndex) {
      require(_optionIndex <= numOptions, "invalid-option");
      _;
    }

    modifier voteRunning() {
      require(block.timestamp <= voteDeadline, "vote-not-running");
      _;
    }

    modifier isRevealPeriod() {
      require(block.timestamp > voteDeadline, "vote-not-finished");
      require(voteDeadline + revealPeriod > block.timestamp, "not-in-reveal-period");
      _;
    }

    function startVote(uint256 _deadline, uint256 _revealPeriod, uint256 _numOptions) public voteNotStarted {
      require(_numOptions > 1, "invalid-number-of-options");
      voteDeadline = _deadline;
      revealPeriod = _revealPeriod;
      numOptions = _numOptions;
    }

    function submitSecret(bytes32 _valueHash, uint256 _saltHash) public payable voteRunning {
      require(msg.value >= 1 ether, "invalid-value");

      bytes32 firstLevelHash = keccak256(abi.encodePacked(_valueHash, _saltHash));

      depositAndLock(msg.value, firstLevelHash);
      insertFirstLevelHash(firstLevelHash);
    }

    function revealSecret(uint256 _optionIndex, bytes32 _valueHash, bytes32[] memory _siblings) public
    isRevealPeriod
    validOption(_optionIndex)
    {
      verifyProof(rootHash, _valueHash, _siblings);
      voteCount[_optionIndex] += 1;
      unlockAndWithdraw(msg.sender, keccak256(abi.encodePacked(_valueHash, _siblings[0])));
    }

    function getNumberOfVotesFor(uint256 _optionIndex) public view returns (uint256) {
      return voteCount[_optionIndex];
    }

    function getNumberOfOptions() public view returns (uint256) {
      return numOptions;
    }

    function getVoteDeadline() public view returns (uint256) {
      return voteDeadline;
    }

    function getRevealPeriodLength() public view returns (uint256) {
      return revealPeriod;
    }
}
