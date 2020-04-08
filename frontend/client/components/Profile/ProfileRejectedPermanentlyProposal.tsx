import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Popconfirm, message } from 'antd';
import { UserProposal } from 'types';
import { deletePendingProposal } from 'modules/users/actions';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import './ProfilePending.less';

interface OwnProps {
  proposal: UserProposal;
}

interface StateProps {
  user: AppState['auth']['user'];
}

interface DispatchProps {
  deletePendingProposal: typeof deletePendingProposal;
}

type Props = OwnProps & StateProps & DispatchProps;

interface State {
  isDeleting: boolean;
}

class ProfilePending extends React.Component<Props, State> {
  state: State = {
    isDeleting: false,
  };

  render() {
    const { status, title, proposalId, rejectReason } = this.props.proposal;
    const { isDeleting } = this.state;

    const isDisableActions = isDeleting;

    return (
      <div className="ProfilePending">
        <div className="ProfilePending-block">
          <Link to={`/proposals/${proposalId}`} className="ProfilePending-title">
            {title}
          </Link>
          <div className={`ProfilePending-status is-${status.toLowerCase()}`}>
            <div>This proposal has been rejected permanently:</div>
            <q>{rejectReason}</q>
            <div>You may not re-submit it for approval.</div>
          </div>
        </div>
        <div className="ProfilePending-block is-actions">
          <Popconfirm
            key="delete"
            title="Are you sure?"
            onConfirm={() => this.handleDelete()}
          >
            <Button type="default" disabled={isDisableActions} loading={isDeleting}>
              Delete
            </Button>
          </Popconfirm>
        </div>
      </div>
    );
  }

  private handleDelete = async () => {
    const {
      user,
      proposal: { proposalId },
    } = this.props;
    if (!user) return;
    this.setState({ isDeleting: true });
    try {
      await this.props.deletePendingProposal(user.userid, proposalId);
      message.success('Proposal deleted.');
    } catch (e) {
      message.error(e.message || e.toString());
    }
    this.setState({ isDeleting: false });
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    user: state.auth.user,
  }),
  {
    deletePendingProposal,
  },
)(ProfilePending);
