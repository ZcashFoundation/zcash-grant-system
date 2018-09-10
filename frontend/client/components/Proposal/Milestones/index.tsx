import React from 'react';
import moment from 'moment';
import { Timeline, Spin, Icon } from 'antd';
import {
  ProposalWithCrowdFund,
  Milestone,
  MILESTONE_STATE,
} from 'modules/proposals/reducers';
import Web3Container, { Web3RenderProps } from 'lib/Web3Container';
import * as Styled from './styled';

interface OwnProps {
  proposal: ProposalWithCrowdFund;
}

interface Web3Props {
  web3: any;
}

type Props = OwnProps & Web3Props;

class Milestones extends React.Component<Props> {
  render() {
    const { proposal, web3 } = this.props;

    if (!proposal) {
      return <Spin />;
    }

    const { milestones } = proposal;
    return (
      <Timeline style={{ maxWidth: '800px' }}>
        {milestones.map((milestone, i) => {
          let paymentInfo;
          let icon;
          let color = 'blue';
          switch (milestone.state) {
            case MILESTONE_STATE.PAID:
              color = 'green';
              paymentInfo = (
                <Styled.MilestonePayoutAmount>
                  The team was awarded{' '}
                  <strong>
                    {web3.utils.fromWei(String(milestone.amount), 'ether')} ETH
                  </strong>{' '}
                  {milestone.isImmediatePayout
                    ? 'as an initial payout'
                    : `on ${moment(milestone.payoutRequestVoteDeadline).format(
                        'MMM Do, YYYY',
                      )}`}
                </Styled.MilestonePayoutAmount>
              );
              break;
            case MILESTONE_STATE.ACTIVE:
              icon = <Icon type="exclamation-circle-o" />;
              paymentInfo = (
                <Styled.MilestonePayoutAmount>
                  Payout vote is in progress! Go to the Governance tab to see more.
                </Styled.MilestonePayoutAmount>
              );
              break;
            case MILESTONE_STATE.REJECTED:
              color = 'red';
              paymentInfo = (
                <>
                  <Styled.MilestonePayoutAmount>
                    Payout was voted against on{' '}
                    {moment(milestone.payoutRequestVoteDeadline).format('MMM Do, YYYY')}
                  </Styled.MilestonePayoutAmount>
                  <Styled.MilestonePayoutInfo>
                    They can request another payout vote at any time
                  </Styled.MilestonePayoutInfo>
                </>
              );
              break;
            default:
              paymentInfo = (
                <>
                  <Styled.MilestonePayoutAmount>
                    Rewards team with{' '}
                    <strong>
                      {web3.utils.fromWei(String(milestone.amount), 'ether')} ETH
                    </strong>
                  </Styled.MilestonePayoutAmount>
                  <Styled.MilestonePayoutInfo>
                    {milestone.isImmediatePayout
                      ? 'Paid immediately upon funding completion'
                      : 'Paid only on approval after 7 day voting period'}
                  </Styled.MilestonePayoutInfo>
                </>
              );
          }

          return (
            <Timeline.Item color={color} dot={icon} key={i}>
              <Styled.Milestone>
                {/* TODO: Real data from backend */}
                <Styled.MilestoneTitle>{milestone.title}</Styled.MilestoneTitle>
                {!milestone.isImmediatePayout && (
                  <Styled.MilestoneEstimate>
                    Estimate: {moment(milestone.dateEstimated).format('MMMM YYYY')}
                  </Styled.MilestoneEstimate>
                )}
                <Styled.MilestoneDescription>
                  {milestone.body}
                </Styled.MilestoneDescription>
                {paymentInfo}
              </Styled.Milestone>
            </Timeline.Item>
          );
        })}
      </Timeline>
    );
  }
}

export default (props: OwnProps) => (
  <Web3Container
    renderLoading={() => <Spin />}
    render={({ web3 }: Web3RenderProps) => <Milestones web3={web3} {...props} />}
  />
);
