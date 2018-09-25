import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { ProposalCard } from 'components/Proposals/ProposalCard';

import 'styles/style.less';
import 'components/Proposal/style.less';
import 'components/Proposal/Governance/style.less';
import { getProposalWithCrowdFund } from './props';

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
  created: Date.now() - 1000 * 60 * 60 * 10,
  deadline: Date.now() - 1,
});

storiesOf('Proposals', module)
  .add('ProposalCard - narrow', () => {
    const style = {
      width: '300px',
      padding: '0 0.5em 0.5em 0',
    };
    return (
      <div
        className="ProposalGovernance"
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          padding: '2em',
        }}
      >
        <div style={style}>
          Started - no funding
          <ProposalCard {...propsNoFunding} />
        </div>
        <div style={style}>
          Started - half funded
          <ProposalCard {...propsHalfFunded} />
        </div>
        <div style={style}>
          Started - fully funded
          <ProposalCard {...propsFunded} />
        </div>
        <div style={style}>
          Started - expired
          <ProposalCard {...propsNotFundedExpired} />
        </div>
      </div>
    );
  })
  .add('ProposalCard - wide', () => {
    const style = {
      padding: '0 0.5em 0.5em 0',
    };
    return (
      <div
        className="ProposalGovernance"
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          padding: '2em',
        }}
      >
        <div style={style}>
          Started - no funding
          <ProposalCard {...propsNoFunding} />
        </div>
        <div style={style}>
          Started - half funded
          <ProposalCard {...propsHalfFunded} />
        </div>
        <div style={style}>
          Started - fully funded
          <ProposalCard {...propsFunded} />
        </div>
        <div style={style}>
          Started - expired
          <ProposalCard {...propsNotFundedExpired} />
        </div>
      </div>
    );
  });
