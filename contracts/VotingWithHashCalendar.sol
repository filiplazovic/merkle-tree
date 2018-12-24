pragma solidity ^0.5.1;

import "./VotingBase.sol";
import "./HashCalendar/SimpleHashCalendar.sol";

contract VotingWithHashCalendar is VotingBase, SimpleHashCalendar {
  function submitSecret(bytes32 _secret) public voteRunning {
    require(isUserEligable(msg.sender), "user-not-eligable");
    insert(_secret);
    unlockUserDeposit(msg.sender);
  }

  function revealSecret(bytes32 _option, bytes32 _secretHash, uint256 _rootHashPairId) public voteFinished {
    require(!secrets[_secretHash], "secret-already-revealed");
    verifyProof(_secretHash, _rootHashPairId);
    secrets[_secretHash] = true;
    voteCount[_option] += 1;
  }
}
