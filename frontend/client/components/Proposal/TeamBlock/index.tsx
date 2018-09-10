import React from 'react';
import { Spin } from 'antd';
import { CrowdFund } from 'modules/proposals/reducers';
import UserRow from 'components/UserRow';
import * as ProposalStyled from '../styled';

interface Props {
  crowdFund: CrowdFund;
}

const TeamBlock = ({ crowdFund }: Props) => {
  let content;
  if (crowdFund) {
    content = crowdFund.trustees.map(trustee => (
      <UserRow key={trustee} address={trustee} />
    ));
  } else {
    content = <Spin />;
  }

  return (
    <ProposalStyled.SideBlock>
      <ProposalStyled.BlockTitle>Team</ProposalStyled.BlockTitle>
      <ProposalStyled.Block>{content}</ProposalStyled.Block>
    </ProposalStyled.SideBlock>
  );
};

export default TeamBlock;
