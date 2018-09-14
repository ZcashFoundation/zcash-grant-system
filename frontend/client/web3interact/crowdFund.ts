import { CrowdFund, Milestone, MILESTONE_STATE } from 'modules/proposals/reducers';
import { collectArrayElements } from 'utils/web3Utils';
import BN from 'bn.js';

export async function getCrowdFundState(
  crowdFundContract: any,
  account: string,
  web3: any,
): Promise<CrowdFund> {
  const immediateFirstMilestonePayout = await crowdFundContract.methods
    .immediateFirstMilestonePayout()
    .call({ from: account });
  const target = await crowdFundContract.methods.raiseGoal().call({ from: account });
  const beneficiary = await crowdFundContract.methods
    .beneficiary()
    .call({ from: account });
  const isRaiseGoalReached = await crowdFundContract.methods
    .isRaiseGoalReached()
    .call({ from: account });
  const balance = await web3.eth.getBalance(crowdFundContract._address);
  const funded = isRaiseGoalReached ? target : balance;
  const amountVotingForRefund = isRaiseGoalReached
    ? await crowdFundContract.methods.amountVotingForRefund().call({ from: account })
    : '0';

  const isFrozen = await crowdFundContract.methods.frozen().call({ from: account });
  const trustees = await collectArrayElements<string>(
    crowdFundContract.methods.trustees,
    account,
  );

  // Format milestones
  const rawMilestones = await collectArrayElements(
    crowdFundContract.methods.milestones,
    account,
  );

  const milestones = rawMilestones.map(
    (m: any, index): Milestone => {
      const amount = new BN(m.amount);
      const payoutRequestVoteDeadline = parseInt(m.payoutRequestVoteDeadline, 10) * 1000;
      const amountAgainstPayout = new BN(m.amountVotingAgainstPayout);
      const percentAgainstPayout =
        amountAgainstPayout
          .muln(1000)
          .div(new BN(target))
          .toNumber() / 10; // results in one significant digit, e.g. 49.9

      // Figure out state if they've raised
      let state = MILESTONE_STATE.WAITING;
      if (isRaiseGoalReached) {
        if (payoutRequestVoteDeadline) {
          if (m.paid) {
            state = MILESTONE_STATE.PAID;
          } else if (payoutRequestVoteDeadline > Date.now()) {
            state = MILESTONE_STATE.ACTIVE;
          } else if (percentAgainstPayout >= 50) {
            state = MILESTONE_STATE.REJECTED;
          } else {
            // Deadline is over, but not rejected, means it's basically paid out.
            // isPaid can be false, but the state be paid, if they haven't actually
            // received the payment.
            state = MILESTONE_STATE.PAID;
          }
        }
      }

      return {
        index,
        state,
        amount,
        amountAgainstPayout,
        percentAgainstPayout,
        payoutRequestVoteDeadline,
        isPaid: m.paid,
        isImmediatePayout: index === 0 && immediateFirstMilestonePayout,
      };
    },
  );

  // Collect & format all contributors
  const contributorAddresses = await collectArrayElements(
    crowdFundContract.methods.contributorList,
    account,
  );

  const contributors = await Promise.all(
    contributorAddresses.map(async addr => {
      const contributor = await crowdFundContract.methods
        .contributors(addr)
        .call({ from: account });
      contributor.address = addr;
      contributor.milestoneNoVotes = await Promise.all(
        milestones.map(
          async (_, idx) =>
            await crowdFundContract.methods
              .getContributorMilestoneVote(addr, idx)
              .call({ form: account }),
        ),
      );
      return contributor;
    }),
  );

  // Convert to milliseconds
  const milestoneVotingPeriod =
    parseInt(
      await crowdFundContract.methods.milestoneVotingPeriod().call({ from: account }),
      10,
    ) *
    60 *
    1000;

  const deadline =
    parseInt(await crowdFundContract.methods.deadline().call({ from: account }), 10) *
    1000;

  return {
    immediateFirstMilestonePayout,
    // TODO: Bignumber these 4
    balance: parseFloat(web3.utils.fromWei(String(balance), 'ether')),
    funded: parseFloat(web3.utils.fromWei(String(funded), 'ether')),
    target: parseFloat(web3.utils.fromWei(String(target), 'ether')),
    amountVotingForRefund: parseFloat(
      web3.utils.fromWei(String(amountVotingForRefund), 'ether'),
    ),
    beneficiary,
    deadline,
    trustees,
    contributors,
    milestones,
    isFrozen,
    isRaiseGoalReached,
    milestoneVotingPeriod,
  };
}
