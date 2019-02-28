import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { ProposalCampaignBlock } from 'components/Proposal/CampaignBlock';

import 'styles/style.less';
import 'components/Proposal/style.less';
import 'components/Proposal/Governance/style.less';
import { generateProposal } from './props';

const user = {
  userid: 1,
  displayName: 'Duderino',
  title: 'The dudester',
  socialMedias: [],
  avatar: null,
};
const propsNoFunding = generateProposal({
  amount: 5,
  funded: 0,
});
const propsHalfFunded = generateProposal({
  amount: 5,
  funded: 2.5,
});
const propsFunded = generateProposal({
  amount: 5,
  funded: 5,
});
const propsNotFundedExpired = generateProposal({
  created: Date.now() - 10,
  deadline: Date.now() - 1,
});

const CampaignBlocks = ({ style }: { style: any }) => (
  <React.Fragment>
    <div style={style}>
      <ProposalCampaignBlock {...propsNoFunding} authUser={user} />
    </div>
    <div style={style}>
      <ProposalCampaignBlock {...propsHalfFunded} authUser={user} />
    </div>
    <div style={style}>
      <ProposalCampaignBlock {...propsFunded} authUser={user} />
    </div>
    <div style={style}>
      <ProposalCampaignBlock {...propsNotFundedExpired} authUser={user} />
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
  ));
