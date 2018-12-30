pragma solidity ^0.5.1;

import "./Staking/Staking.sol";
import "./Merkle/MerkleTree.sol";

contract Voting is Staking, MerkleTree {
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

    // @notice Starts a vote by setting the deadline, reveal period and number of options
    // @param _deadline Timestamp of the deadline
    // @param _revealPeriod Duration of the reveal period
    // @param _numOptions Number of options in vote
    function startVote(uint256 _deadline, uint256 _revealPeriod, uint256 _numOptions) public voteNotStarted {
      require(_numOptions > 1, "invalid-number-of-options");
      // TODO add checks for valid deadline and reveal period
      voteDeadline = _deadline;
      revealPeriod = _revealPeriod;
      numOptions = _numOptions;
    }

    // @notice Submits a hash of the secret and stakes one ether to participate in a vote
    // @param _valueHash Hash of the secret value
    // @param _saltHash Hash of the salt
    function submitSecret(bytes32 _valueHash, uint256 _saltHash) public payable voteRunning {
      require(msg.value >= 1 ether, "invalid-value");

      bytes32 firstLevelHash = keccak256(abi.encodePacked(_valueHash, _saltHash));

      stake(msg.value, firstLevelHash);
      insertFirstLevelHash(firstLevelHash);
    }

    // TODO: If secret is not revealed during reveal period,
    // the stake is stuck on this contract, figure out what to do with it
    // @notice Reveal the secret by passing the proof that it exists in merkle tree
    // @param _optionIndex Option you want to vote for
    // @param _valueHash Hash of the secret value
    // @param _siblings Pair nodes that are required to prove that value is inside the tree
    function revealSecret(uint256 _optionIndex, bytes32 _valueHash, bytes32[] memory _siblings) public
    isRevealPeriod
    validOption(_optionIndex)
    {
      // Check if proof is valid
      verifyProof(rootHash, _valueHash, _siblings);
      voteCount[_optionIndex] += 1;
      // Withdraw staked amount to the sender of the transaction
      withdraw(msg.sender, keccak256(abi.encodePacked(_valueHash, _siblings[0])));
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
