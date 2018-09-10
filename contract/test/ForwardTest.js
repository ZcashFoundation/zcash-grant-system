const Forward = artifacts.require("Forward");

contract("Forward", accounts => {
  const [creatorAccount, destinationAddress] = accounts;
  const amount = 1;

  let forward;

  beforeEach(async () => {
    forward = await Forward.new(destinationAddress, { from: creatorAccount });
  });

  it("deposits", async () => {
    await forward.sendTransaction({ from: creatorAccount, value: amount });
    const forwardBalance = await web3.eth.getBalance(forward.address);
    assert.equal(forwardBalance.toNumber(), amount);
  });

  it("forwards", async () => {
    const initBalance = await web3.eth.getBalance(destinationAddress);
    await forward.sendTransaction({ from: creatorAccount, value: amount });
    await forward.payOut({ from: creatorAccount });
    const finalBalance = await web3.eth.getBalance(destinationAddress);
    assert.ok(finalBalance.gt(initBalance));
  });
});
