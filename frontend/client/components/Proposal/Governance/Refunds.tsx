import React from 'react';
import { connect } from 'react-redux';
import { Spin, Progress, Button, Alert } from 'antd';
import { ProposalWithCrowdFund } from 'modules/proposals/reducers';
import Web3Container, { Web3RenderProps } from 'lib/Web3Container';
import { web3Actions } from 'modules/web3';
import { AppState } from 'store/reducers';
import * as Styled from './styled';

interface OwnProps {
  proposal: ProposalWithCrowdFund;
}

interface StateProps {
  isRefundActionPending: AppState['web3']['isRefundActionPending'];
  refundActionError: AppState['web3']['refundActionError'];
}

interface ActionProps {
  voteRefund: typeof web3Actions['voteRefund'];
  withdrawRefund: typeof web3Actions['withdrawRefund'];
}

interface Web3Props {
  web3: Web3RenderProps['web3'];
  account: Web3RenderProps['accounts'][0];
}

type Props = OwnProps & StateProps & ActionProps & Web3Props;

class GovernanceRefunds extends React.Component<Props> {
  render() {
    const { proposal, account, isRefundActionPending, refundActionError } = this.props;
    const { crowdFund } = proposal;
    const contributor = crowdFund.contributors.find(c => c.address === account);
    const isTrustee = crowdFund.trustees.includes(account);
    const hasVotedForRefund = contributor && contributor.refundVote;
    const hasRefunded = contributor && contributor.refunded;
    const refundPct = Math.floor(
      (crowdFund.amountVotingForRefund / crowdFund.target) * 100,
    );
    const color = refundPct < 10 ? '#1890ff' : refundPct < 50 ? '#faad14' : '#f5222d';

    let text;
    let button;
    if (!isTrustee && contributor) {
      if (refundPct < 50) {
        text = `
          As a funder of this project, you have the right to vote for a refund. If the
          amount of funds contributed by refund voters exceeds half of the project's
          total raised funds, all funders will be able to request refunds.
        `;
        if (hasVotedForRefund) {
          button = {
            text: 'Undo vote for refund',
            type: 'danger',
            onClick: () => this.voteRefund(false),
          };
        } else {
          button = {
            text: 'Vote for refund',
            type: 'danger',
            onClick: () => this.voteRefund(true),
          };
        }
      } else {
        if (hasRefunded) {
          return (
            <Alert
              type="success"
              message="Your refund has been processed"
              description={`
                We apologize for any inconvenience this propsal has caused you. Please
                let us know if there's anything we could have done to improve your
                experience.
              `}
              showIcon
            />
          );
        } else {
          text = (
            <>
              The majority of funders have voted for a refund. Click below to receive your
              refund.
              {!crowdFund.isFrozen && (
                <Alert
                  style={{ marginTop: '1rem' }}
                  type="info"
                  message={`
                  This will require multiple transactions to process, sorry
                  for the inconvenience
                `}
                  showIcon
                />
              )}
            </>
          );
          button = {
            text: 'Get your refund',
            type: 'primary',
            onClick: () => this.withdrawRefund(),
          };
        }
      }
    } else {
      if (refundPct < 50) {
        text = `
          Funders can vote to request refunds. If the amount of funds contributed by
          refund voters exceeds half of the funds contributed, all funders will be able
          to request refunds.
        `;
      } else {
        text = `
          The funders of this project have voted for a refund. All funders can request refunds,
          and the project will no longer receive any payouts.
        `;
      }
    }

    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Styled.ProgressContainer stroke={color}>
            <Progress type="dashboard" percent={refundPct} format={p => `${p}%`} />
            <Styled.ProgressText>voted for a refund</Styled.ProgressText>
          </Styled.ProgressContainer>
          <div>
            <p style={{ fontSize: '1rem' }}>{text}</p>
            {button && (
              <Button
                type={button.type as any}
                onClick={button.onClick}
                loading={isRefundActionPending}
                block
              >
                {button.text}
              </Button>
            )}
          </div>
        </div>
        {refundActionError && (
          <Alert
            type="error"
            message="Something went wrong!"
            description={refundActionError}
            style={{ margin: '1rem 0 0' }}
            showIcon
          />
        )}
      </>
    );
  }

  voteRefund = (vote: boolean) => {
    this.props.voteRefund(this.props.proposal.crowdFundContract, vote);
  };

  withdrawRefund = () => {
    const { proposal, account } = this.props;
    this.props.withdrawRefund(proposal.crowdFundContract, account);
  };
}

const ConnectedGovernanceRefunds = connect<StateProps, ActionProps, OwnProps, AppState>(
  state => ({
    isRefundActionPending: state.web3.isRefundActionPending,
    refundActionError: state.web3.refundActionError,
  }),
  {
    voteRefund: web3Actions.voteRefund,
    withdrawRefund: web3Actions.withdrawRefund,
  },
)(GovernanceRefunds);

export default (props: OwnProps) => (
  <Web3Container
    renderLoading={() => <Spin />}
    render={({ web3, accounts }: Web3RenderProps) => (
      <ConnectedGovernanceRefunds web3={web3} account={accounts[0]} {...props} />
    )}
  />
);
