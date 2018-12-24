pragma solidity ^0.5.1;

import "./TokenLocking/TokenLockingWithCount.sol";

contract VotingBase is TokenLockingWithCount {
    uint256 voteDeadline;
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

    function addOption(bytes32 _description) public voteNotStarted {
      // TODO make sure we cant add 2 same options
      voteOptions.push(_description);
    }

    function startVote(uint256 _deadline) public voteNotStarted {
      require(voteOptions.length > 1, "invalid-number-of-options");
      voteDeadline = _deadline;
      lockAllDeposits();
    }

    function getNumberOfVotesFor(uint256 _optionIndex) public view returns (uint256) {
      return voteCount[voteOptions[_optionIndex]];
    }
}
