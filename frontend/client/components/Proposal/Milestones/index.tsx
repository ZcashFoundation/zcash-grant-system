import React from 'react';
import moment from 'moment';
import { Timeline, Spin, Icon } from 'antd';
import { ProposalWithCrowdFund, MILESTONE_STATE } from 'modules/proposals/reducers';
import UnitDisplay from 'components/UnitDisplay';
import './style.less';

interface OwnProps {
  proposal: ProposalWithCrowdFund;
}

type Props = OwnProps;

export default class ProposalMilestones extends React.Component<Props> {
  render() {
    const { proposal } = this.props;

    if (!proposal) {
      return <Spin />;
    }

    const { milestones } = proposal;
    return (
      <Timeline className="ProposalMilestones" style={{ maxWidth: '800px' }}>
        {milestones.map((milestone, i) => {
          let paymentInfo;
          let icon;
          let color = 'blue';
          switch (milestone.state) {
            case MILESTONE_STATE.PAID:
              color = 'green';
              paymentInfo = (
                <div className="ProposalMilestones-milestone-payoutAmount">
                  The team was awarded{' '}
                  <strong>
                    <UnitDisplay value={milestone.amount} symbol="ETH" />
                  </strong>{' '}
                  {milestone.isImmediatePayout
                    ? 'as an initial payout'
                    : `on ${moment(milestone.payoutRequestVoteDeadline).format(
                        'MMM Do, YYYY',
                      )}`}
                </div>
              );
              break;
            case MILESTONE_STATE.ACTIVE:
              icon = <Icon type="exclamation-circle-o" />;
              paymentInfo = (
                <div className="ProposalMilestones-milestone-payoutAmount">
                  Payout vote is in progress! Go to the Governance tab to see more.
                </div>
              );
              break;
            case MILESTONE_STATE.REJECTED:
              color = 'red';
              paymentInfo = (
                <>
                  <div className="ProposalMilestones-milestone-payoutAmount">
                    Payout was voted against on{' '}
                    {moment(milestone.payoutRequestVoteDeadline).format('MMM Do, YYYY')}
                  </div>
                  <div className="ProposalMilestones-milestone-payoutInfo">
                    They can request another payout vote at any time
                  </div>
                </>
              );
              break;
            default:
              paymentInfo = (
                <>
                  <div className="ProposalMilestones-milestone-payoutAmount">
                    Rewards team with{' '}
                    <strong>
                      <UnitDisplay value={milestone.amount} symbol="ETH" />
                    </strong>
                  </div>
                  <div className="ProposalMilestones-milestone-payoutInfo">
                    {milestone.isImmediatePayout
                      ? 'Paid immediately upon funding completion'
                      : 'Paid only on approval after 7 day voting period'}
                  </div>
                </>
              );
          }

          return (
            <Timeline.Item color={color} dot={icon} key={i}>
              <div className="ProposalMilestones-milestone">
                {/* TODO: Real data from backend */}
                <h3 className="ProposalMilestones-milestone-title">{milestone.title}</h3>
                {!milestone.isImmediatePayout && (
                  <div className="ProposalMilestones-milestone-estimate">
                    Estimate: {moment(milestone.dateEstimated).format('MMMM YYYY')}
                  </div>
                )}
                <p className="ProposalMilestones-milestone-description">
                  {milestone.body}
                </p>
                {paymentInfo}
              </div>
            </Timeline.Item>
          );
        })}
      </Timeline>
    );
  }
}
