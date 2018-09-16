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
    if (crowdFund.contributors.length) {
      content = crowdFund.contributors.map(contributor => (
        <UserRow
          key={contributor.address}
          address={contributor.address}
          amount={contributor.contributionAmount}
        />
      ));
    } else {
      content = <h5>No contributors found.</h5>;
    }
  } else {
    content = <Spin />;
  }

  return (
    <ProposalStyled.SideBlock>
      {crowdFund.contributors.length ? (
        <>
          <ProposalStyled.BlockTitle>Contributors</ProposalStyled.BlockTitle>
          <ProposalStyled.Block>{content}</ProposalStyled.Block>
        </>
      ) : (
        content
      )}
    </ProposalStyled.SideBlock>
  );
};

export default ContributorsBlock;
