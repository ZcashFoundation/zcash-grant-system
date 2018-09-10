// source: https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/test/helpers/increaseTime.js

const should = require("chai").should();

async function assertRevert(promise) {
  try {
    await promise;
  } catch (error) {
    error.message.should.include(
      "revert",
      `Expected "revert", got ${error} instead`
    );
    return;
  }
  should.fail("Expected revert not received");
}


async function assertVMException(promise) {
  try {
    await promise;
  } catch (error) {
    error.message.should.include(
      "VM Exception",
      `Expected "VM Exception", got ${error} instead`
    );
    return;
  }
  should.fail("Expected VM Exception not received");
}

async function increaseTime(duration) {
  const id = Date.now();

  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync(
      {
        jsonrpc: "2.0",
        method: "evm_increaseTime",
        params: [duration],
        id: id
      },
      err1 => {
        if (err1) return reject(err1);

        web3.currentProvider.sendAsync(
          {
            jsonrpc: "2.0",
            method: "evm_mine",
            id: id + 1
          },
          (err2, res) => {
            return err2 ? reject(err2) : resolve(res);
          }
        );
      }
    );
  });
}

module.exports = {
  assertRevert,
  increaseTime,
  assertVMException
};