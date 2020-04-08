import React from 'react';
import { UserProposal, UserCCR } from 'types';
import ProfileRejectedPermanentlyProposal from './ProfileRejectedPermanentlyProposal';
import ProfileRejectedPermanentlyCCR from './ProfileRejectedPermanentlyCCR';

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
          <ProfileRejectedPermanentlyProposal key={p.proposalId} proposal={p} />
        ))}
        {requests.map(r => (
          <ProfileRejectedPermanentlyCCR key={r.ccrId} ccr={r} />
        ))}
      </>
    );
  }
}

export default ProfilePendingList;
