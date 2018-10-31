import Web3 from 'web3';
import { CrowdFund, Milestone, MILESTONE_STATE } from 'types';
import { collectArrayElements } from 'utils/web3';
import { Wei } from 'utils/units';
import BN from 'bn.js';

export async function getCrowdFundState(
  crowdFundContract: any,
  account: string,
  web3: Web3,
): Promise<CrowdFund> {
  const immediateFirstMilestonePayout = await crowdFundContract.methods
    .immediateFirstMilestonePayout()
    .call({ from: account });
  const target = Wei(await crowdFundContract.methods.raiseGoal().call({ from: account }));
  const beneficiary = await crowdFundContract.methods
    .beneficiary()
    .call({ from: account });
  const isRaiseGoalReached = await crowdFundContract.methods
    .isRaiseGoalReached()
    .call({ from: account });
  // Types are messed up, this returns a str, not a number
  // https://web3js.readthedocs.io/en/1.0/web3-eth.html#getbalance
  const balance = Wei((await web3.eth.getBalance(crowdFundContract._address)) as any);
  const funded = isRaiseGoalReached ? target : balance;
  const percentFunded = isRaiseGoalReached
    ? 100
    : balance.divn(100).isZero()
      ? 0
      : balance
          .mul(new BN(100))
          .div(target)
          .toNumber();
  const amountVotingForRefund = isRaiseGoalReached
    ? Wei(await crowdFundContract.methods.amountVotingForRefund().call({ from: account }))
    : Wei('0');
  const percentVotingForRefund = amountVotingForRefund.div(target.divn(100)).toNumber();

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
      const amount = Wei(m.amount);
      const payoutRequestVoteDeadline = parseInt(m.payoutRequestVoteDeadline, 10) * 1000;
      const amountAgainstPayout = Wei(m.amountVotingAgainstPayout);
      const percentAgainstPayout = amountAgainstPayout.div(target.divn(100)).toNumber();

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
      contributor.contributionAmount = Wei(
        await crowdFundContract.methods
          .getContributorContributionAmount(addr)
          .call({ from: account }),
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
    balance,
    funded,
    percentFunded,
    target,
    amountVotingForRefund,
    percentVotingForRefund,
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
