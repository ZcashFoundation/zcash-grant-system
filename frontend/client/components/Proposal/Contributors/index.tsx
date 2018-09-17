import React from 'react';
import { Spin } from 'antd';
import { CrowdFund } from 'modules/proposals/reducers';
import UserRow from 'components/UserRow';
import * as ProposalStyled from '../styled';
import Placeholder from 'components/Placeholder';
import UnitDisplay from 'components/UnitDisplay';

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
          secondary={<UnitDisplay value={contributor.contributionAmount} symbol="ETH" />}
        />
      ));
    } else {
      content = (
        <Placeholder
          style={{ minHeight: '220px' }}
          title="No contributors found"
          subtitle={`
            No contributions have been made to this proposal.
            Check back later once there's been at least one contribution.
          `}
        />
      );
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
