import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { ProposalCampaignBlock } from 'components/Proposal/CampaignBlock';
import Contributors from 'components/Proposal/Contributors';
import { Milestones as GovernanceMilestones } from 'components/Proposal/Governance/Milestones';
import Milestones from 'components/Proposal/Milestones';
import { MILESTONE_STATE } from 'modules/proposals/reducers';
const { WAITING, ACTIVE, PAID, REJECTED } = MILESTONE_STATE;

import 'styles/style.less';
import 'components/Proposal/style.less';
import 'components/Proposal/Governance/style.less';
import { getProposalWithCrowdFund, getGovernanceMilestonesProps } from './props';

const propsNoFunding = getProposalWithCrowdFund({
  amount: 5,
  funded: 0,
});
const propsHalfFunded = getProposalWithCrowdFund({
  amount: 5,
  funded: 2.5,
});
const propsFunded = getProposalWithCrowdFund({
  amount: 5,
  funded: 5,
});
const propsNotFundedExpired = getProposalWithCrowdFund({
  created: Date.now() - 10,
  deadline: Date.now() - 1,
});

const msWaiting = { state: WAITING, isPaid: false };
const msPaid = { state: PAID, isPaid: true };
const msActive = { state: ACTIVE, isPaid: false };
const msRejected = { state: REJECTED, isPaid: false };

const propsMilestoneActive = getProposalWithCrowdFund({
  milestoneOverrides: [msPaid, msActive, msWaiting],
});
const propsMilestoneActiveOneVote = getProposalWithCrowdFund({
  milestoneOverrides: [
    msPaid,
    { state: ACTIVE, isPaid: false, percentAgainstPayout: 33 },
    msWaiting,
  ],
  contributorOverrides: [{ milestoneNoVotes: [false, true, false] }],
});
const propsMilestoneRejected = getProposalWithCrowdFund({
  milestoneOverrides: [msPaid, msPaid, msRejected],
});
const propsMilestoneFirstPaid = getProposalWithCrowdFund({
  milestoneOverrides: [msPaid, msWaiting, msWaiting],
});
const propsMilestoneSecondUncollected = getProposalWithCrowdFund({
  milestoneOverrides: [msPaid, { state: PAID, isPaid: false }, msWaiting],
});
const propsMilestoneInitialSuccessNotPaid = getProposalWithCrowdFund({
  milestoneOverrides: [
    { state: ACTIVE, isPaid: false, payoutRequestVoteDeadline: Date.now() },
  ],
});
const propsMilestoneAllPaid = getProposalWithCrowdFund({
  milestoneOverrides: [msPaid, msPaid, msPaid],
});

const trusteeInactiveFirstImmediateGovernanceMilestoneProps = Object.assign(
  getGovernanceMilestonesProps({ isContributor: false }),
  propsFunded,
);
const trusteeActiveNotPaidFirstImmediateGovernanceMilestoneProps = Object.assign(
  getGovernanceMilestonesProps({ isContributor: false }),
  propsMilestoneInitialSuccessNotPaid,
);
const trusteeInactiveFirstPaidGovernanceMilestoneProps = Object.assign(
  getGovernanceMilestonesProps({ isContributor: false }),
  propsMilestoneFirstPaid,
);
const trusteeUncollectedSecondGovernanceMilestoneProps = Object.assign(
  getGovernanceMilestonesProps({ isContributor: false }),
  propsMilestoneSecondUncollected,
);
const trusteeActiveFirstPaidGovernanceMilestoneProps = Object.assign(
  getGovernanceMilestonesProps({ isContributor: false }),
  propsMilestoneActive,
);
const trusteeAllPaidGovernanceMilestoneProps = Object.assign(
  getGovernanceMilestonesProps({ isContributor: false }),
  propsMilestoneAllPaid,
);

const contributorInactiveGovernanceMilestoneProps = Object.assign(
  getGovernanceMilestonesProps({}),
  propsFunded,
);
const contributorActiveGovernanceMilestoneProps = Object.assign(
  getGovernanceMilestonesProps({}),
  propsMilestoneActive,
);
const contributorActiveOneVoteGovernanceMilestoneProps = Object.assign(
  getGovernanceMilestonesProps({}),
  propsMilestoneActiveOneVote,
);
const contributorAllPaidGovernanceMilestoneProps = Object.assign(
  getGovernanceMilestonesProps({}),
  propsMilestoneAllPaid,
);

const CampaignBlocks = ({ style }: { style: any }) => (
  <React.Fragment>
    <div style={style}>
      <ProposalCampaignBlock {...propsNoFunding} />
    </div>
    <div style={style}>
      <ProposalCampaignBlock {...propsHalfFunded} />
    </div>
    <div style={style}>
      <ProposalCampaignBlock {...propsFunded} />
    </div>
    <div style={style}>
      <ProposalCampaignBlock {...propsNotFundedExpired} />
    </div>
  </React.Fragment>
);

storiesOf('Proposal', module)
  .add('CampaignBlock - narrow', () => (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      <CampaignBlocks style={{ width: '19rem', margin: '0 12px' }} />
    </div>
  ))
  .add('CampaignBlock - wide', () => (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      <CampaignBlocks style={{ margin: '0 12px' }} />
    </div>
  ))
  .add('Contributors', () => (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Contributors crowdFund={propsFunded.proposal.crowdFund} />
    </div>
  ))
  .add('Governance/Milestones trustee', () => {
    const style = {
      maxWidth: '500px',
      margin: '0 0 1.5em',
      padding: '0.5em',
      border: '1px solid #cccccc',
      flex: '1 1 0%',
    };
    return (
      <div
        className="ProposalGovernance"
        style={{
          display: 'flex',
          flex: '1 1 0%',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '2em',
        }}
      >
        <div>
          Trustee - immediate initial payout
          <div style={style}>
            <GovernanceMilestones
              {...trusteeInactiveFirstImmediateGovernanceMilestoneProps}
            />
          </div>
        </div>
        <div>
          Trustee - immediate initial payout, accepted not paid
          <div style={style}>
            <GovernanceMilestones
              {...trusteeActiveNotPaidFirstImmediateGovernanceMilestoneProps}
            />
          </div>
        </div>
        <div>
          Trustee - first milestone paid
          <div style={style}>
            <GovernanceMilestones {...trusteeInactiveFirstPaidGovernanceMilestoneProps} />
          </div>
        </div>
        <div>
          Trustee - second milestone active
          <div style={style}>
            <GovernanceMilestones {...trusteeActiveFirstPaidGovernanceMilestoneProps} />
          </div>
        </div>
        <div>
          Trustee - second milestone uncollected
          <div style={style}>
            <GovernanceMilestones {...trusteeUncollectedSecondGovernanceMilestoneProps} />
          </div>
        </div>
        <div>
          Trustee - all paid
          <div style={style}>
            <GovernanceMilestones {...trusteeAllPaidGovernanceMilestoneProps} />
          </div>
        </div>
      </div>
    );
  })
  .add('Governance/Milestones contributor', () => {
    const style = {
      maxWidth: '500px',
      margin: '0 0 1.5em',
      padding: '0.5em',
      border: '1px solid #cccccc',
    };
    return (
      <div
        className="ProposalGovernance"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '2em',
        }}
      >
        <div>
          Contributor - innactive milestones
          <div style={style}>
            <GovernanceMilestones {...contributorInactiveGovernanceMilestoneProps} />
          </div>
        </div>
        <div>
          Contributor - active milestone
          <div style={style}>
            <GovernanceMilestones {...contributorActiveGovernanceMilestoneProps} />
          </div>
        </div>
        <div>
          Contributor - active milestone - voted against
          <div style={style}>
            <GovernanceMilestones {...contributorActiveOneVoteGovernanceMilestoneProps} />
          </div>
        </div>
        <div>
          Contributor - all paid
          <div style={style}>
            <GovernanceMilestones {...contributorAllPaidGovernanceMilestoneProps} />
          </div>
        </div>
      </div>
    );
  })
  .add('Milestones - waiting', () => (
    <div style={{ paddingTop: '2em', display: 'flex', justifyContent: 'center' }}>
      <Milestones {...propsFunded} />
    </div>
  ))
  .add('Milestones - active', () => (
    <div style={{ paddingTop: '2em', display: 'flex', justifyContent: 'center' }}>
      <Milestones {...propsMilestoneActive} />
    </div>
  ))
  .add('Milestones - rejected', () => (
    <div style={{ paddingTop: '2em', display: 'flex', justifyContent: 'center' }}>
      <Milestones {...propsMilestoneRejected} />
    </div>
  ));
