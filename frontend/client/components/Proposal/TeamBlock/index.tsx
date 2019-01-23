import React from 'react';
import { Proposal } from 'types';
import Loader from 'components/Loader';
import UserRow from 'components/UserRow';

interface Props {
  proposal: Proposal;
}

const TeamBlock = ({ proposal }: Props) => {
  let content;
  if (proposal) {
    content = proposal.team.map(user => <UserRow key={user.displayName} user={user} />);
  } else {
    content = <Loader />;
  }

  return (
    <div className="Proposal-top-side-block">
      <h1 className="Proposal-top-main-block-title">Team</h1>
      <div className="Proposal-top-main-block">{content}</div>
    </div>
  );
};

export default TeamBlock;
