import React from 'react';
import { Spin } from 'antd';
import { CrowdFund } from 'modules/proposals/reducers';
import AddressRow from 'components/AddressRow';
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
        <AddressRow
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
    <div className="Proposal-top-side-block">
      {crowdFund.contributors.length ? (
        <>
          <h1 className="Proposal-top-main-block-title">Contributors</h1>
          <div className="Proposal-top-main-block">{content}</div>
        </>
      ) : (
        content
      )}
    </div>
  );
};

export default ContributorsBlock;
