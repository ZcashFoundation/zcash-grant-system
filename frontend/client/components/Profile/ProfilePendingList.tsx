import React from 'react';
import { Link } from 'react-router-dom';
import { Modal } from 'antd';
import { UserProposal } from 'types';
import ProfilePending from './ProfilePending';

interface OwnProps {
  proposals: UserProposal[];
}

type Props = OwnProps;

const STATE = {
  publishedId: null as null | UserProposal['proposalId'],
};

type State = typeof STATE;

class ProfilePendingList extends React.Component<Props, State> {
  state = STATE;
  render() {
    const { proposals } = this.props;
    const { publishedId } = this.state;
    return (
      <>
        {proposals.map(p => (
          <ProfilePending
            key={p.proposalId}
            proposal={p}
            onPublish={this.handlePublish}
          />
        ))}

        <Modal
          title="Proposal Published"
          visible={!!publishedId}
          footer={null}
          onCancel={() => this.setState({ publishedId: null })}
        >
          <div>
            Your proposal is live!{' '}
            <Link to={`/proposals/${publishedId}`}>Click here</Link> to check it out.
          </div>
        </Modal>
      </>
    );
  }

  private handlePublish = (publishedId: UserProposal['proposalId']) => {
    this.setState({ publishedId });
  };
}

export default ProfilePendingList;
