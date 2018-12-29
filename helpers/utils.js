async function checkErrorRevert(promise, errorMessage) {
  let txError;
  try {
    await promise;
  } catch (err) {
    txError = err;
    if (!txError.reason) {
      const message = txError.toString().split('revert ')[1];
      assert.equal(message, errorMessage);
    } else {
      assert.equal(err.reason, errorMessage);
    }
  }
  assert.exists(txError, "Transaction didn't failed");
}

async function getCurrentTimestamp() {
  const latestBlock = await web3.eth.getBlock("latest");
  return latestBlock.timestamp;
}

async function forwardTime(seconds) {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [seconds],
      id: new Date().getSeconds()
    }, (err, resp) => {
      if (err) reject(err);
      web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_mine',
        params: [],
        id: new Date().getSeconds()
      }, (err2, resp2) => {
        if (err2) {
          reject(err2);
        }
        resolve(resp2);
      });
    });
  });
}

module.exports = {
  checkErrorRevert,
  getCurrentTimestamp,
  forwardTime
}
