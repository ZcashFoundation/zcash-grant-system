// test/CrowdFundTest.js
// References https://michalzalecki.com/ethereum-test-driven-introduction-to-solidity/
const PrivateFund = artifacts.require("PrivateFund");
const { assertRevert } = require("./utils");

const ETHER = 10 ** 18;

contract("PrivateFund", accounts => {
  const [
    funderAccount,
    firstTrusteeAccount,
    refundAccount,
    boardOne,
    boardTwo,
    boardThree
  ] = accounts;
  const raiseGoal = 1 * ETHER;
  const halfRaiseGoal = raiseGoal / 2;
  const beneficiary = firstTrusteeAccount;
  // TODO - set multiple trustees and add tests
  const trustees = [beneficiary];
  const quorum = 2;
  const boardMembers = [boardOne, boardTwo, boardThree];
  const milestones = [halfRaiseGoal, halfRaiseGoal];
  const funder = funderAccount;
  const useQuroumForRefund = false;

  let privateFund;

  beforeEach(async () => {
    privateFund = await PrivateFund.new(
      raiseGoal,
      beneficiary,
      trustees,
      quorum,
      boardMembers,
      milestones,
      funder,
      useQuroumForRefund,
      { from: funderAccount }
    );
  });

  // [BEGIN] constructor
  // TODO - test all initial variables have expected values
  it("initializes", async () => {
    assert.equal(await privateFund.raiseGoal.call(), raiseGoal);
    assert.equal(await privateFund.beneficiary.call(), beneficiary);

    trustees.forEach(async (address, i) => {
      assert.equal(await privateFund.trustees.call(i), trustees[i]);
    });

    // TODO - get working
    // milestones.forEach(async (milestoneAmount, i) => {
    //   console.log(i)
    //   assert.equal(await privateFund.milestones(i)[0], milestoneAmount);
    // });
  });

  // [END] constructor
  // [BEGIN] contribute

  it("revert on next contribution once raise goal is reached", async () => {
    await privateFund.contribute({
      from: funderAccount,
      value: raiseGoal
    });
    assertRevert(
      privateFund.contribute({
        from: funderAccount,
        value: raiseGoal
      })
    );
  });

  it("revert when raiseGoal isn't paid in full", async () => {
    assertRevert(
      privateFund.contribute({
        from: funderAccount,
        value: raiseGoal / 5
      })
    );
  });

  it("amountRaised is set after contribution", async () => {
    await privateFund.contribute({
      from: funderAccount,
      value: raiseGoal
    });
    assert.equal(
      (await privateFund.amountRaised()).toNumber(),
      (await privateFund.raiseGoal()).toNumber()
    );
  });

  // [BEGIN] requestMilestonePayout

  it("does not request milestone when earlier milestone is unpaid", async () => {
    await privateFund.contribute({ from: funderAccount, value: raiseGoal });
    assertRevert(
      privateFund.requestMilestonePayout(1, { from: firstTrusteeAccount })
    );
  });

  it("does not allow milestone request when caller is not trustee", async () => {
    assertRevert(
      privateFund.requestMilestonePayout(0, { from: funderAccount })
    );
  });

  it("does not allow milestone request when milestone has already been paid", async () => {
    await privateFund.contribute({ from: funderAccount, value: raiseGoal });
    const initBalance = await web3.eth.getBalance(beneficiary);
    await privateFund.requestMilestonePayout(0, { from: beneficiary });
    await privateFund.voteMilestonePayout(0, true, { from: boardOne });
    await privateFund.voteMilestonePayout(0, true, { from: boardTwo });
    await privateFund.payMilestonePayout(0);
    const finalBalance = await web3.eth.getBalance(beneficiary);
    assert.ok(finalBalance.greaterThan(initBalance));
    assertRevert(privateFund.requestMilestonePayout(0, { from: beneficiary }));
  });

  // [END] requestMilestonePayout
  // [BEGIN] voteMilestonePayout

  it("persists board member votes", async () => {
    await privateFund.contribute({
      from: funderAccount,
      value: raiseGoal
    });

    await privateFund.requestMilestonePayout(0, { from: firstTrusteeAccount });

    await privateFund.voteMilestonePayout(0, true, { from: boardOne });
    await privateFund.voteMilestonePayout(0, true, { from: boardTwo });
    assert.equal((await privateFund.getBoardMemberMilestoneVote(boardOne, 0)), true )
  });

  it("only allows board members to vote", async () => {
    await privateFund.contribute({
      from: funderAccount,
      value: raiseGoal
    });

    await privateFund.requestMilestonePayout(0, { from: firstTrusteeAccount });

    assertRevert(
      privateFund.voteMilestonePayout(0, true, { from: funderAccount }) // even funders can't vote unless they are also part of the board
    );
  });

  it("does not allow milestone voting before vote period has started", async () => {
    await privateFund.contribute({
      from: funderAccount,
      value: raiseGoal
    });

    assertRevert(
      privateFund.voteMilestonePayout(0, true, { from: boardThree })
    );
  });

  // [END] voteMilestonePayout
  // [BEGIN] payMilestonePayout

  it("pays milestone when milestone is unpaid, quorum is reached, caller is trustee, and no earlier milestone is unpaid", async () => {
    await privateFund.contribute({ from: funderAccount, value: raiseGoal });
    const initBalance = await web3.eth.getBalance(beneficiary);

    await privateFund.requestMilestonePayout(0, { from: firstTrusteeAccount });
    // quorum of two needed
    await privateFund.voteMilestonePayout(0, true, { from: boardOne });
    await privateFund.voteMilestonePayout(0, true, { from: boardTwo });

    await privateFund.payMilestonePayout(0);
    const finalBalance = await web3.eth.getBalance(firstTrusteeAccount);
    assert.ok(finalBalance.greaterThan(initBalance));
  });

  it("does not pay milestone when raise goal is not met", async () => {
    assert.ok(
      (await privateFund.raiseGoal()).gt(await privateFund.amountRaised())
    );
    assertRevert(
      privateFund.requestMilestonePayout(0, { from: firstTrusteeAccount })
    );
  });

  it("does not pay milestone when quorum is not reached", async () => {
    await privateFund.contribute({ from: funderAccount, value: raiseGoal });
    await privateFund.requestMilestonePayout(0, { from: firstTrusteeAccount });
    // only one vote in favor
    await privateFund.voteMilestonePayout(0, true, { from: boardOne });
    assertRevert(privateFund.payMilestonePayout(0));
  });

  // [END] payMilestonePayout
  // [BEGIN] voteRefundAddress

  it("keeps track of refund vote address choices", async () => {
    await privateFund.contribute({ from: funderAccount, value: raiseGoal });
    await privateFund.voteRefundAddress(refundAccount, { from: boardOne });
    await privateFund.voteRefundAddress(refundAccount, { from: boardTwo });
    assert.equal((await privateFund.boardMembers(boardOne))[0], refundAccount);
    assert.equal((await privateFund.boardMembers(boardTwo))[0], refundAccount);
  });

  it("does not allow non-contributors to vote", async () => {
    await privateFund.contribute({
      from: funderAccount,
      value: raiseGoal
    });
    assertRevert(privateFund.voteRefundAddress(true, { from: funderAccount }));
  });

  // [BEGIN] refund

  // TODO - fix up
  // it("refunds to voted refund address", async () => {
  //   const refundBalanceInit = await web3.eth.getBalance(refundAccount);
  //
  //   await privateFund.contribute({ from: funderAccount, value: raiseGoal });
  //   await privateFund.voteRefundAddress(refundAccount, { from: boardOne });
  //   await privateFund.voteRefundAddress(refundAccount, { from: boardTwo });
  //   await privateFund.voteRefundAddress(refundAccount, { from: boardThree });
  //   await privateFund.refund(refundAccount, { from: boardTwo });
  //
  //   const refundBalancePostRefund = await web3.eth.getBalance(refundAccount);
  //
  //   assert.ok(refundBalancePostRefund.gt(refundBalanceInit));
  // });
  //
  // [END] refund
});
