pragma solidity ^0.5.1;

contract TokenLockingWithTimestamp {
  mapping (bytes32 => uint256) locks;

  function depositAndLock(uint256 _amount, bytes32 _secretHash) internal {
    require(locks[_secretHash] == 0, "stake-already-deposited");
    locks[_secretHash] = _amount;
  }

  function unlockAndWithdraw(address payable _recipient, bytes32 _secretHash) internal {
    require(locks[_secretHash] > 0, "stake-not-locked");
    locks[_secretHash] = 0;
    _recipient.transfer(locks[_secretHash]);
  }

  function getLockedAmountFor(bytes32 _secretHash) public view returns (uint256) {
    return locks[_secretHash];
  }
}
