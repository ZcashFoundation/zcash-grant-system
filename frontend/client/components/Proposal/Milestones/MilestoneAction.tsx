import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Button, Progress, Alert } from 'antd';
import { ProposalWithCrowdFund, MILESTONE_STATE } from 'modules/proposals/reducers';
import { web3Actions } from 'modules/web3';
import { AppState } from 'store/reducers';
import UnitDisplay from 'components/UnitDisplay';
import Placeholder from 'components/Placeholder';
import './MilestoneAction.less';
import { REJECTED } from 'redux-promise-middleware';

interface OwnProps {
  proposal: ProposalWithCrowdFund;
}

interface StateProps {
  isMilestoneActionPending: AppState['web3']['isMilestoneActionPending'];
  milestoneActionError: AppState['web3']['milestoneActionError'];
  accounts: AppState['web3']['accounts'];
}

interface ActionProps {
  requestMilestonePayout: typeof web3Actions['requestMilestonePayout'];
  payMilestonePayout: typeof web3Actions['payMilestonePayout'];
  voteMilestonePayout: typeof web3Actions['voteMilestonePayout'];
}

type Props = OwnProps & StateProps & ActionProps;

export class Milestones extends React.Component<Props> {
  render() {
    const {
      proposal,
      accounts,
      isMilestoneActionPending,
      milestoneActionError,
    } = this.props;
    const { crowdFund } = proposal;
    if (!crowdFund.isRaiseGoalReached) {
      return (
        <Placeholder
          title="Milestone governance isn’t available yet"
          subtitle={`
            Milestone history and voting status will be displayed here
            once the project has been funded
          `}
        />
      );
    }
    const contributor = crowdFund.contributors.find(c => c.address === accounts[0]);
    const isTrustee = crowdFund.trustees.includes(accounts[0]);
    const firstMilestone = proposal.milestones[0];
    const isImmediatePayout = crowdFund.immediateFirstMilestonePayout;
    // TODO: Should this information be abstracted to a lib or redux?
    const hasImmediatePayoutStarted =
      isImmediatePayout && firstMilestone.payoutRequestVoteDeadline;
    const hasImmediatePayoutBeenPaid = isImmediatePayout && firstMilestone.isPaid;
    const activeVoteMilestone = proposal.milestones.find(
      m => m.state === MILESTONE_STATE.ACTIVE,
    );
    const uncollectedMilestone = proposal.milestones.find(
      m => m.state === MILESTONE_STATE.PAID && !m.isPaid,
    );
    const nextUnpaidMilestone = proposal.milestones.find(
      m => m.state !== MILESTONE_STATE.PAID,
    );

    let content;
    let button;
    let showVoteProgress = false;
    if (isTrustee) {
      // Trustee views, i.e. admin actions
      if (isImmediatePayout && !hasImmediatePayoutBeenPaid) {
        if (!hasImmediatePayoutStarted) {
          content = (
            <p className="MilestoneAction-text">
              Congratulations on getting funded! You can now begin the process of
              receiving your initial payment. Click below to begin a milestone payout
              request. It will instantly be approved, and you’ll be able to request the
              funds immediately after.
            </p>
          );
          button = {
            text: 'Request initial payout',
            type: 'primary',
            onClick: () => this.requestPayout(0),
          };
        } else {
          content = (
            <p className="MilestoneAction-text">
              Your initial payout is ready! Click below to claim it.
            </p>
          );
          button = {
            text: 'Receive initial payout',
            type: 'primary',
            onClick: () => this.payPayout(0),
          };
        }
      } else if (activeVoteMilestone) {
        content = (
          <p className="MilestoneAction-text">
            The vote for your payout is in progress. If payout rejection votes don’t
            exceed 50% before{' '}
            {moment(activeVoteMilestone.payoutRequestVoteDeadline).format(
              'MMM Do, h:mm a',
            )}
            , you will be able to collect your payment then.
          </p>
        );
        showVoteProgress = true;
      } else if (uncollectedMilestone) {
        content = (
          <p className="MilestoneAction-text">
            Congratulations! Your milestone payout request was succesful. Click below to
            receive your payment of{' '}
            <strong>
              <UnitDisplay value={uncollectedMilestone.amount} symbol="ETH" />
            </strong>
            .
          </p>
        );
        button = {
          text: 'Receive milestone payout',
          type: 'primary',
          onClick: () => this.payPayout(uncollectedMilestone.index),
        };
      } else if (nextUnpaidMilestone) {
        content = (
          <p className="MilestoneAction-text">
            {nextUnpaidMilestone.state === REJECTED
              ? 'You can make another request for this milestone payout. '
              : 'You can request a payout for this milestone. '}
            If fewer than 50% of funders vote against it before{' '}
            {moment(Date.now() + crowdFund.milestoneVotingPeriod).format('MMM Do h:mm a')}
            , you will be able to collect your payout here.
          </p>
        );
        button = {
          text: 'Request milestone payout',
          type: 'primary',
          onClick: () => this.requestPayout(nextUnpaidMilestone.index),
        };
      } else {
        content = <p>All milestones have been paid! Thanks for the hard work.</p>;
      }
    } else {
      // User views, i.e. funders or any public spectator
      if (activeVoteMilestone) {
        const hasVotedAgainst =
          contributor && contributor.milestoneNoVotes[activeVoteMilestone.index];
        if (contributor) {
          if (hasVotedAgainst) {
            button = {
              text: 'Revert vote against payout',
              type: 'danger',
              onClick: () => this.votePayout(activeVoteMilestone.index, false),
            };
          } else {
            button = {
              text: 'Vote against payout',
              type: 'danger',
              onClick: () => this.votePayout(activeVoteMilestone.index, true),
            };
          }
        }

        content = (
          <p className="MilestoneAction-text">
            A milestone vote is currently in progress. If funders vote against paying out
            the milestone by over 50% before{' '}
            {moment(activeVoteMilestone.payoutRequestVoteDeadline).format(
              'MMM Do h:mm a',
            )}
            , the team will not receive the funds.
            {contributor && ' Since you funded this proposal, you can vote below.'}
          </p>
        );
        showVoteProgress = true;
      } else if (nextUnpaidMilestone) {
        content = (
          <p className="MilestoneAction-text">
            There is no milestone vote currently active.
          </p>
        );
      } else {
        content = (
          <p className="MilestoneAction-text">All milestones have been paid out.</p>
        );
      }
    }

    return (
      <div className="MilestonAction">
        <div className="MilestoneAction-top">
          {showVoteProgress && (
            <div className="MilestoneAction-progress">
              <Progress
                type="dashboard"
                percent={activeVoteMilestone.percentAgainstPayout}
                format={p => `${p}%`}
                status="exception"
              />
              <div className="MilestoneAction-progress-text">voted against payout</div>
            </div>
          )}
          <div>
            {content}
            {button && (
              <Button
                type={button.type as any}
                loading={isMilestoneActionPending}
                onClick={button.onClick}
                block
              >
                {button.text}
              </Button>
            )}
          </div>
        </div>
        {milestoneActionError && (
          <Alert
            type="error"
            message="Something went wrong!"
            description={milestoneActionError}
            style={{ margin: '1rem 0' }}
            showIcon
          />
        )}
      </div>
    );
  }

  private requestPayout = (milestoneIndex: number) => {
    const { crowdFundContract } = this.props.proposal;
    this.props.requestMilestonePayout(crowdFundContract, milestoneIndex);
  };

  private payPayout = (milestoneIndex: number) => {
    const { crowdFundContract } = this.props.proposal;
    this.props.payMilestonePayout(crowdFundContract, milestoneIndex);
  };

  private votePayout = (milestoneIndex: number, vote: boolean) => {
    const { crowdFundContract } = this.props.proposal;
    this.props.voteMilestonePayout(crowdFundContract, milestoneIndex, vote);
  };
}

const ConnectedMilestones = connect(
  (state: AppState) => ({
    accounts: state.web3.accounts,
    isMilestoneActionPending: state.web3.isMilestoneActionPending,
    milestoneActionError: state.web3.milestoneActionError,
  }),
  {
    requestMilestonePayout: web3Actions.requestMilestonePayout,
    payMilestonePayout: web3Actions.payMilestonePayout,
    voteMilestonePayout: web3Actions.voteMilestonePayout,
  },
)(Milestones);

export default (props: OwnProps) => <ConnectedMilestones {...props} />;
