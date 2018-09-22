import React from 'react';
import { Spin } from 'antd';
import { CrowdFund } from 'modules/proposals/reducers';
import UserRow from 'components/UserRow';

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
    <div className="Proposal-top-side-block">
      <h1 className="Proposal-top-main-block-title">Team</h1>
      <div className="Proposal-top-main-block">{content}</div>
    </div>
  );
};

export default TeamBlock;
