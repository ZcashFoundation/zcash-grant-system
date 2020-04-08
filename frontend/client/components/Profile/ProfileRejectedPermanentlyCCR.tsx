import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Popconfirm, message } from 'antd';
import { UserCCR } from 'types';
import { deletePendingRequest, fetchUser } from 'modules/users/actions';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import './ProfilePending.less';

interface OwnProps {
  ccr: UserCCR;
}

interface StateProps {
  user: AppState['auth']['user'];
}

interface DispatchProps {
  deletePendingRequest: typeof deletePendingRequest;
  fetchUser: typeof fetchUser;
}

type Props = OwnProps & StateProps & DispatchProps;

interface State {
  isDeleting: boolean;
}

class ProfilePendingCCR extends React.Component<Props, State> {
  state: State = {
    isDeleting: false,
  };

  render() {
    const { status, title, ccrId, rejectReason } = this.props.ccr;
    const { isDeleting } = this.state;

    const isDisableActions = isDeleting;

    return (
      <div className="ProfilePending">
        <div className="ProfilePending-block">
          <Link to={`/ccrs/${ccrId}`} className="ProfilePending-title">
            {title}
          </Link>
          <div className={`ProfilePending-status is-${status.toLowerCase()}`}>
            <div>This request has been rejected permanently:</div>
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
      ccr: { ccrId },
    } = this.props;
    if (!user) return;
    this.setState({ isDeleting: true });
    try {
      await this.props.deletePendingRequest(user.userid, ccrId);
      message.success('Request deleted.');
      await this.props.fetchUser(String(user.userid));
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
    deletePendingRequest,
    fetchUser,
  },
)(ProfilePendingCCR);
