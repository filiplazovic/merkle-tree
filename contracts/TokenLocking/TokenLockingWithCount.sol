pragma solidity ^0.5.1;

contract TokenLockingWithCount {
  struct Lock {
    uint256 amount;
    uint256 count;
  }

  uint256 globalLockCount;
  mapping (address => Lock) locks;

  modifier notLocked() {
    require(locks[msg.sender].count == globalLockCount, "users-eth-not-locked");
    _;
  }

  function deposit() public payable notLocked {
    require(msg.value >= 1 ether, "invalid-value");
    // TODO Add checks for overflow
    locks[msg.sender].amount += msg.value;
  }

  function withdraw() public notLocked {
    address(msg.sender).transfer(locks[msg.sender].amount);
    locks[msg.sender].amount = 0;
  }

  function unlockUserDeposit(address _user) internal {
    require(globalLockCount - locks[_user].count == 1, "user-deposit-not-locked");
    locks[_user].count += 1;
  }

  function isUserEligable(address _user) public view returns (bool) {
    return locks[_user].amount > 0;
  }

  function lockAllDeposits() internal {
    globalLockCount += 1;
  }

  function getGlobalLockCount() public view returns (uint256) {
    return globalLockCount;
  }
}
