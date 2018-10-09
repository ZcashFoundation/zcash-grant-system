import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { ProposalCampaignBlock } from 'components/Proposal/CampaignBlock';
import Contributors from 'components/Proposal/Contributors';

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
  created: Date.now() - 10,
  deadline: Date.now() - 1,
});

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
  ));
