import React from 'react';
import { Spin } from 'antd';
import AddressRow from 'components/AddressRow';
import Placeholder from 'components/Placeholder';
import UnitDisplay from 'components/UnitDisplay';

const ContributorsBlock = () => {
  // TODO: Get contributors from proposal
  console.warn('TODO: Get contributors from proposal for Proposal/Contributors/index.tsx');
  const proposal = { contributors: [] as any };
  let content;
  if (proposal) {
    if (proposal.contributors.length) {
      content = proposal.contributors.map((contributor: any) => (
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
      {proposal.contributors.length ? (
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
