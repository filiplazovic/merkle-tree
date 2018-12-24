pragma solidity ^0.5.1;

contract TokenLockingWithTimestamp {
  struct Lock {
    uint256 amount;
    uint256 timestamp;
  }

  mapping (address => Lock) locks;

  function depositAndLock(uint256 _amount, uint256 _timestamp) public payable {
    require(msg.value >= 1 ether, "invalid-value");
    require(locks[msg.sender].amount == 0, "stake-already-deposited");
    // TODO Add checks for overflow
    locks[msg.sender] = Lock(_amount, _timestamp);
  }

  function withdraw() public {
    require(locks[msg.sender].timestamp > 0, "stake-not-locked");
    require(block.timestamp > locks[msg.sender].timestamp, "stake-locked");
    address(msg.sender).transfer(locks[msg.sender].amount);
    locks[msg.sender] = Lock(0, 0);
  }
}
