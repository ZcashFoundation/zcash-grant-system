const CrowdFund = artifacts.require("CrowdFund");
const { increaseTime } = require("./utils");

const HOUR = 3600;
const DAY = HOUR * 24;
const ETHER = 10 ** 18;
const DEADLINE = DAY * 100;
const AFTER_DEADLINE_EXPIRES = DEADLINE + DAY;

contract("CrowdFund Deadline", accounts => {
  const [
    firstAccount,
    firstTrusteeAccount,
    thirdAccount,
    fourthAccount
  ] = accounts;
  const raiseGoal = ETHER;
  const beneficiary = firstTrusteeAccount;
  // TODO - set multiple trustees and add tests
  const trustees = [firstTrusteeAccount];
  // TODO - set multiple milestones and add tests
  const milestones = [raiseGoal];
  const deadline = DEADLINE;
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
      { from: firstAccount }
    );
  });

  it("returns true when isFailed is called after deadline has passed", async () => {
    assert.equal(await crowdFund.isFailed.call(), false);
    await increaseTime(AFTER_DEADLINE_EXPIRES);
    assert.equal(await crowdFund.isFailed.call(), true);
  });

  it("allows anyone to refund after time is up and goal is not reached", async () => {
    const fundAmount = raiseGoal / 10;
    await crowdFund.contribute({ from: fourthAccount, value: fundAmount });
    assert.equal(
      (await crowdFund.contributors(fourthAccount))[0].toNumber(),
      fundAmount
    );
    assert.equal(await crowdFund.contributorList(0), fourthAccount);
    const initBalance = await web3.eth.getBalance(fourthAccount);
    await increaseTime(AFTER_DEADLINE_EXPIRES);
    await crowdFund.refund();
    await crowdFund.withdraw(fourthAccount);
    const finalBalance = await web3.eth.getBalance(fourthAccount);
    assert.ok(finalBalance.greaterThan(initBalance)); // hard to be exact due to the gas usage
  });

  it("refunds remaining proportionally when fundraiser has failed", async () => {
    const tenthOfRaiseGoal = raiseGoal / 10;
    await crowdFund.contribute({
      from: fourthAccount,
      value: tenthOfRaiseGoal
    });
    const initBalanceFourthAccount = await web3.eth.getBalance(fourthAccount);
    await increaseTime(AFTER_DEADLINE_EXPIRES);
    assert.ok(await crowdFund.isFailed());
    await crowdFund.refund();
    await crowdFund.withdraw(fourthAccount);
    const finalBalanceFourthAccount = await web3.eth.getBalance(fourthAccount);
    assert.ok(finalBalanceFourthAccount.gt(initBalanceFourthAccount));
  });

  it("refund remaining proportionally when fundraiser has failed (more complex)", async () => {
    const tenthOfRaiseGoal = raiseGoal / 10;
    await crowdFund.contribute({
      from: fourthAccount,
      value: tenthOfRaiseGoal
    });
    await crowdFund.contribute({
      from: thirdAccount,
      value: tenthOfRaiseGoal * 4
    });
    const initBalanceFourthAccount = await web3.eth.getBalance(fourthAccount);
    const initBalanceThirdAccount = await web3.eth.getBalance(thirdAccount);
    await increaseTime(AFTER_DEADLINE_EXPIRES);
    assert.ok(await crowdFund.isFailed());
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
    await crowdFund.refund();
    await crowdFund.withdraw(fourthAccount);
    await crowdFund.withdraw(thirdAccount);
    const finalBalanceFourthAccount = await web3.eth.getBalance(fourthAccount);
    const finalBalanceThirdAccount = await web3.eth.getBalance(thirdAccount);
    assert.ok(finalBalanceFourthAccount.gt(initBalanceFourthAccount));
    assert.ok(finalBalanceThirdAccount.gt(initBalanceThirdAccount));
  });
});
