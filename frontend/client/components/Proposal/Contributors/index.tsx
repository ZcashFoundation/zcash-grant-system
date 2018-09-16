import React from 'react';
import { Spin } from 'antd';
import { CrowdFund } from 'modules/proposals/reducers';
import UserRow from 'components/UserRow';
import * as ProposalStyled from '../styled';

interface Props {
  crowdFund: CrowdFund;
}

const ContributorsBlock = ({ crowdFund }: Props) => {
  let content;
  if (crowdFund) {
    content = crowdFund.contributors.map(contributor => (
      <UserRow
        key={contributor.address}
        address={contributor.address}
        amount={contributor.contributionAmount}
      />
    ));
  } else {
    content = <Spin />;
  }

  return (
    <ProposalStyled.SideBlock>
      <ProposalStyled.BlockTitle>Contributors</ProposalStyled.BlockTitle>
      <ProposalStyled.Block>{content}</ProposalStyled.Block>
    </ProposalStyled.SideBlock>
  );
};

export default ContributorsBlock;
