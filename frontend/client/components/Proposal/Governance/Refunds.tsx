import React from 'react';
import { Spin, Progress, Button } from 'antd';
import { ProposalWithCrowdFund } from 'modules/proposals/reducers';
import Web3Container, { Web3RenderProps } from 'lib/Web3Container';

interface OwnProps {
  proposal: ProposalWithCrowdFund;
}

interface Web3Props {
  web3: Web3RenderProps['web3'];
}

type Props = OwnProps & Web3Props;

class GovernanceRefunds extends React.Component<Props> {
  render() {
    const fundPct = 32;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ textAlign: 'center', marginRight: '2rem' }}>
          <Progress
            type="dashboard"
            percent={fundPct}
            format={p => `${p}%`}
            status="exception"
          />
          <p style={{ opacity: 0.6, fontSize: '0.75rem' }}>voted for a refund</p>
        </div>
        <div>
          <p style={{ fontSize: '1rem' }}>
            As a funder of this project, you have the right to vote for a refund. If the
            amount of funds contributed by refund voters exceeds half of the project's
            total raised funds, a refund will be issued to everyone.
          </p>
          <Button type="danger" block>
            Vote for a Refund
          </Button>
        </div>
      </div>
    );
  }
}

export default (props: OwnProps) => (
  <Web3Container
    renderLoading={() => <Spin />}
    render={({ web3 }: Web3RenderProps) => <GovernanceRefunds web3={web3} {...props} />}
  />
);
