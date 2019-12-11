import React from 'react';
import { UserProposal, UserCCR } from 'types';
import ProfilePending from './ProfilePending';
import ProfilePendingCCR from './ProfilePendingCCR';

interface OwnProps {
  proposals: UserProposal[];
  requests: UserCCR[];
}

type Props = OwnProps;

class ProfilePendingList extends React.Component<Props> {
  render() {
    const { proposals, requests } = this.props;
    return (
      <>
        {proposals.map(p => (
          <ProfilePending key={p.proposalId} proposal={p} />
        ))}
        {requests.map(r => (
          <ProfilePendingCCR key={r.ccrId} ccr={r} />
        ))}
      </>
    );
  }
}

export default ProfilePendingList;
