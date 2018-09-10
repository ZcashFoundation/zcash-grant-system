// References https://michalzalecki.com/ethereum-test-driven-introduction-to-solidity/
const CrowdFund = artifacts.require("CrowdFund");
const { increaseTime, assertRevert, assertVMException } = require("./utils");

const HOUR = 3600;
const DAY = HOUR * 24;
const ETHER = 10 ** 18;
const NOW = Math.round(new Date().getTime() / 1000);
const AFTER_VOTING_EXPIRES = HOUR * 2;

contract("CrowdFund", accounts => {
  const [
    firstAccount,
    firstTrusteeAccount,
    thirdAccount,
    fourthAccount,
    fifthAccount
  ] = accounts;
  const raiseGoal = 1 * ETHER;
  const beneficiary = firstTrusteeAccount;
  // TODO - set multiple trustees and add tests
  const trustees = [firstTrusteeAccount];
  // TODO - set multiple milestones and add tests
  const milestones = [raiseGoal];
  const deadline = NOW + DAY * 100;
  const milestoneVotingPeriod = HOUR;
  const immediateFirstMilestonePayout = false;

  let crowdFund;

  beforeEach(async () => {
    crowdFund = await CrowdFund.new(
      raiseGoal,
      beneficiary,
      trustees,
      milestones,
      deadline,
      milestoneVotingPeriod,
      immediateFirstMilestonePayout,
      { from: fifthAccount }
    );
  });

  // [BEGIN] constructor
  // TODO - test all initial variables have expected values
  it("initializes", async () => {
    assert.equal(await crowdFund.raiseGoal.call(), raiseGoal);
    assert.equal(await crowdFund.beneficiary.call(), beneficiary);

    trustees.forEach(async (address, i) => {
      assert.equal(await crowdFund.trustees.call(i), trustees[i]);
    });

    milestones.forEach(async (milestoneAmount, i) => {
      assert.equal(await crowdFund.milestones.call(i)[0], milestoneAmount);
    });
  });

  // [END] constructor
  // [BEGIN] contribute

  it("reverts on next contribution once raise goal is reached", async () => {
    await crowdFund.contribute({
      from: firstAccount,
      value: raiseGoal
    });
    assert.ok(await crowdFund.isRaiseGoalReached());
    assertRevert(
      crowdFund.contribute({
        from: firstAccount,
        value: raiseGoal
      })
    );
  });

  it("keeps track of contributions", async () => {
    await crowdFund.contribute({
      from: firstAccount,
      value: raiseGoal / 10
    });
    await crowdFund.contribute({
      from: firstTrusteeAccount,
      value: raiseGoal / 10
    });
    await crowdFund.contribute({
      from: firstTrusteeAccount,
      value: raiseGoal / 10
    });
    assert.equal(
      (await crowdFund.contributors(firstAccount))[0].toNumber(),
      raiseGoal / 10
    );
    assert.equal(
      (await crowdFund.contributors(firstTrusteeAccount))[0].toNumber(),
      raiseGoal / 5
    );
  });

  // TODO BLOCKED - it reverts when contribution is under 1 wei. Blocked by switching contract to use minimum percentage contribution

  it("revertd on contribution that exceeds raise goal", async () => {
    assertRevert(
      crowdFund.contribute({
        from: firstAccount,
        value: raiseGoal + raiseGoal / 10
      })
    );
  });

  // [BEGIN] requestMilestonePayout

  it("does not allow milestone requests when caller is not a trustee", async () => {
    assertRevert(crowdFund.requestMilestonePayout(0, { from: firstAccount }));
  });

  it("does not allow milestone requests when milestone has already been paid", async () => {
    await crowdFund.contribute({ from: thirdAccount, value: raiseGoal });
    const initBalance = await web3.eth.getBalance(firstTrusteeAccount);
    await crowdFund.requestMilestonePayout(0, { from: firstTrusteeAccount });
    await increaseTime(AFTER_VOTING_EXPIRES);
    await crowdFund.payMilestonePayout(0);
    const finalBalance = await web3.eth.getBalance(firstTrusteeAccount);
    assert.ok(finalBalance.greaterThan(initBalance));
    // TODO - enable
    // assertRevert(
    //   crowdFund.requestMilestonePayout(0, { from: firstTrusteeAccount })
    // );
  });

  // [END] requestMilestonePayout
  // [BEGIN] voteMilestonePayout

  it("only counts milestone vote once", async () => {
    const tenthOfRaiseGoal = raiseGoal / 10;
    await crowdFund.contribute({ from: thirdAccount, value: tenthOfRaiseGoal });
    await crowdFund.contribute({
      from: firstAccount,
      value: tenthOfRaiseGoal * 9
    });
    assert.ok(await crowdFund.isRaiseGoalReached());
    await crowdFund.requestMilestonePayout(0, { from: firstTrusteeAccount });
    // first vote
    await crowdFund.voteMilestonePayout(0, true, { from: firstAccount });
    assert.equal(
      (await crowdFund.milestones(0))[1].toNumber(),
      tenthOfRaiseGoal * 9
    );
    // second vote
    assertRevert(
      crowdFund.voteMilestonePayout(0, true, { from: firstAccount })
    );
    assert.equal(
      (await crowdFund.milestones(0))[1].toNumber(),
      tenthOfRaiseGoal * 9
    );
  });

  it("does not allow milestone voting before vote period has started", async () => {
    await crowdFund.contribute({
      from: thirdAccount,
      value: raiseGoal / 10
    });
    await crowdFund.contribute({
      from: firstAccount,
      value: (raiseGoal / 10) * 9
    });
    assertRevert(
      crowdFund.voteMilestonePayout(0, true, { from: thirdAccount })
    );
  });

  it("does not allow milestone voting after vote period has ended", async () => {
    await crowdFund.contribute({
      from: thirdAccount,
      value: raiseGoal / 10
    });
    await crowdFund.contribute({
      from: firstAccount,
      value: (raiseGoal / 10) * 9
    });
    await crowdFund.requestMilestonePayout(0, { from: firstTrusteeAccount });
    await crowdFund.voteMilestonePayout(0, true, { from: thirdAccount });
    await increaseTime(AFTER_VOTING_EXPIRES);
    assertRevert(
      crowdFund.voteMilestonePayout(0, true, { from: firstAccount })
    );
  });

  // [END] voteMilestonePayout
  // [BEGIN] payMilestonePayout

  it("pays milestone when milestone is unpaid, caller is trustee, and no earlier milestone is unpaid", async () => {
    await crowdFund.contribute({ from: thirdAccount, value: raiseGoal });
    const initBalance = await web3.eth.getBalance(firstTrusteeAccount);
    await crowdFund.requestMilestonePayout(0, { from: firstTrusteeAccount });
    await increaseTime(AFTER_VOTING_EXPIRES);
    await crowdFund.payMilestonePayout(0);
    const finalBalance = await web3.eth.getBalance(firstTrusteeAccount);
    assert.ok(finalBalance.greaterThan(initBalance));
  });

  it("does not pay milestone when vote deadline has not passed", async () => {
    await crowdFund.contribute({ from: thirdAccount, value: raiseGoal });
    await crowdFund.requestMilestonePayout(0, { from: firstTrusteeAccount });
    assertRevert(
      crowdFund.payMilestonePayout(0, { from: firstTrusteeAccount })
    );
  });

  it("does not pay milestone when raise goal is not met", async () => {
    await crowdFund.contribute({
      from: thirdAccount,
      value: raiseGoal / 10
    });
    assert.ok((await crowdFund.raiseGoal()).gt(await crowdFund.amountRaised()));
    assertRevert(
      crowdFund.requestMilestonePayout(0, { from: firstTrusteeAccount })
    );
  });

  it("does not pay milestone when majority is voting no on a milestone", async () => {
    await crowdFund.contribute({ from: thirdAccount, value: raiseGoal });
    await crowdFund.requestMilestonePayout(0, { from: firstTrusteeAccount });
    await crowdFund.voteMilestonePayout(0, true, { from: thirdAccount });
    await increaseTime(AFTER_VOTING_EXPIRES);
    assertRevert(crowdFund.payMilestonePayout(0));
  });

  // [END] payMilestonePayout
  // [BEGIN] voteRefund

  it("keeps track of refund vote amount", async () => {
    const tenthOfRaiseGoal = raiseGoal / 10;
    await crowdFund.contribute({ from: thirdAccount, value: tenthOfRaiseGoal });
    await crowdFund.contribute({
      from: firstAccount,
      value: tenthOfRaiseGoal * 9
    });
    assert.ok(await crowdFund.isRaiseGoalReached());
    await crowdFund.voteRefund(true, { from: thirdAccount });
    await crowdFund.voteRefund(true, { from: firstAccount });
    assert.equal(
      (await crowdFund.amountVotingForRefund()).toNumber(),
      tenthOfRaiseGoal * 9 + tenthOfRaiseGoal
    );
    await crowdFund.voteRefund(false, { from: firstAccount });
    assert.equal(
      (await crowdFund.amountVotingForRefund()).toNumber(),
      tenthOfRaiseGoal
    );
  });

  it("does not allow non-contributors to vote", async () => {
    const tenthOfRaiseGoal = raiseGoal / 10;
    await crowdFund.contribute({ from: thirdAccount, value: tenthOfRaiseGoal });
    await crowdFund.contribute({
      from: firstAccount,
      value: tenthOfRaiseGoal * 9
    });
    assert.ok(await crowdFund.isRaiseGoalReached());
    assertRevert(crowdFund.voteRefund(true, { from: firstTrusteeAccount }));
  });

  it("only allows contributors to vote after raise goal has been reached", async () => {
    const tenthOfRaiseGoal = raiseGoal / 10;
    await crowdFund.contribute({
      from: fourthAccount,
      value: tenthOfRaiseGoal
    });
    assert.ok(!(await crowdFund.isRaiseGoalReached()));
    assertRevert(crowdFund.voteRefund(true, { from: fourthAccount }));
    await crowdFund.contribute({
      from: firstAccount,
      value: tenthOfRaiseGoal * 9
    });
    assert.ok(await crowdFund.isRaiseGoalReached());
    assert.ok(await crowdFund.voteRefund(true, { from: fourthAccount }));
  });

  it("only adds refund voter amount once", async () => {
    const tenthOfRaiseGoal = raiseGoal / 10;
    await crowdFund.contribute({ from: thirdAccount, value: tenthOfRaiseGoal });
    await crowdFund.contribute({
      from: firstAccount,
      value: tenthOfRaiseGoal * 9
    });
    assert.ok(await crowdFund.isRaiseGoalReached());
    await crowdFund.voteRefund(true, { from: thirdAccount });
    assert.equal(
      (await crowdFund.amountVotingForRefund()).toNumber(),
      tenthOfRaiseGoal
    );
    await crowdFund.voteRefund(false, { from: thirdAccount });
    assert.equal((await crowdFund.amountVotingForRefund()).toNumber(), 0);
    await crowdFund.voteRefund(true, { from: thirdAccount });
    assert.equal(
      (await crowdFund.amountVotingForRefund()).toNumber(),
      tenthOfRaiseGoal
    );
    assertVMException(crowdFund.voteRefund(true, { from: thirdAccount }));
  });

  // [END] voteRefund
  // [BEGIN] refund

  it("does not allow non-trustees to refund", async () => {
    await crowdFund.contribute({
      from: fourthAccount,
      value: raiseGoal / 5
    });

    assert.ok(!(await crowdFund.isRaiseGoalReached()));
    assertRevert(crowdFund.refund());
  });

  it("allows trustee to refund while the CrowdFund is on-going", async () => {
    await crowdFund.contribute({
      from: fourthAccount,
      value: raiseGoal / 5
    });
    assert.ok(!(await crowdFund.isRaiseGoalReached()));
    const balanceAfterFundingFourthAccount = await web3.eth.getBalance(
      fourthAccount
    );
    await crowdFund.refund({ from: firstTrusteeAccount });
    await crowdFund.withdraw(fourthAccount);
    const balanceAfterRefundFourthAccount = await web3.eth.getBalance(
      fourthAccount
    );
    assert.ok(
      balanceAfterRefundFourthAccount.gt(balanceAfterFundingFourthAccount)
    );
  });

  it("allows trustee to refund after the CrowdFund has finished", async () => {
    await crowdFund.contribute({
      from: fourthAccount,
      value: raiseGoal
    });

    assert.ok(await crowdFund.isRaiseGoalReached());
    const balanceAfterFundingFourthAccount = await web3.eth.getBalance(
      fourthAccount
    );
    await crowdFund.refund({ from: firstTrusteeAccount });
    await crowdFund.withdraw(fourthAccount);
    const balanceAfterRefundFourthAccount = await web3.eth.getBalance(
      fourthAccount
    );
    assert.ok(
      balanceAfterRefundFourthAccount.gt(balanceAfterFundingFourthAccount)
    );
  });

  it("reverts if non-trustee attempts to refund on active CrowdFund", async () => {
    const tenthOfRaiseGoal = raiseGoal / 10;
    await crowdFund.contribute({
      from: fourthAccount,
      value: tenthOfRaiseGoal
    });
    assertRevert(crowdFund.refund());
  });

  it("reverts if non-trustee attempts to refund a successful CrowdFund without a majority voting to refund", async () => {
    const tenthOfRaiseGoal = raiseGoal / 10;
    await crowdFund.contribute({
      from: fourthAccount,
      value: tenthOfRaiseGoal * 2
    });
    await crowdFund.contribute({
      from: thirdAccount,
      value: tenthOfRaiseGoal * 8
    });
    assert.ok(await crowdFund.isRaiseGoalReached());
    assertRevert(crowdFund.refund());
  });

  it("refunds proportionally if majority is voting for refund after raise goal has been reached", async () => {
    const tenthOfRaiseGoal = raiseGoal / 10;
    await crowdFund.contribute({
      from: fourthAccount,
      value: tenthOfRaiseGoal * 2
    });
    await crowdFund.contribute({
      from: thirdAccount,
      value: tenthOfRaiseGoal * 8
    });
    const initBalanceFourthAccount = await web3.eth.getBalance(fourthAccount);
    const initBalanceThirdAccount = await web3.eth.getBalance(thirdAccount);
    assert.ok(await crowdFund.isRaiseGoalReached());
    const afterContributionBalanceFourthAccount = await web3.eth.getBalance(
      fourthAccount
    );
    const afterContributionBalanceThirdAccount = await web3.eth.getBalance(
      thirdAccount
    );
    // fourthAccount contributed a tenth of the raise goal, compared to third account with a fourth
    assert.ok(
      afterContributionBalanceFourthAccount.gt(
        afterContributionBalanceThirdAccount
      )
    );
    await crowdFund.voteRefund(true, { from: thirdAccount });
    await crowdFund.refund();
    await crowdFund.withdraw(fourthAccount);
    await crowdFund.withdraw(thirdAccount);
    const finalBalanceFourthAccount = await web3.eth.getBalance(fourthAccount);
    const finalBalanceThirdAccount = await web3.eth.getBalance(thirdAccount);
    assert.ok(finalBalanceFourthAccount.gt(initBalanceFourthAccount));
    assert.ok(finalBalanceThirdAccount.gt(initBalanceThirdAccount));
  });

  // [END] refund
  // [BEGIN] getContributorMilestoneVote

  it("returns milestone vote for a contributor", async () => {
    await crowdFund.contribute({ from: thirdAccount, value: raiseGoal });
    await crowdFund.requestMilestonePayout(0, { from: firstTrusteeAccount });
    await crowdFund.voteMilestonePayout(0, true, { from: thirdAccount });
    await increaseTime(AFTER_VOTING_EXPIRES);
    const milestoneVote = await crowdFund.getContributorMilestoneVote.call(thirdAccount, 0);
    assert.equal(true, milestoneVote)
  });

});
