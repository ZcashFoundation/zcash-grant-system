import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button, Popconfirm, message, Tag } from 'antd';
import { CCRSTATUS, STATUS, UserCCR } from 'types';
import { deletePendingRequest } from 'modules/users/actions';
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

    const st = {
      [STATUS.REJECTED]: {
        color: 'red',
        tag: 'Changes Requested',
        blurb: (
          <>
            <div>This request has changes requested for the following reason:</div>
            <q>{rejectReason}</q>
            <div>You may edit this request and re-submit it for approval.</div>
          </>
        ),
      },
      [STATUS.PENDING]: {
        color: 'purple',
        tag: 'Pending Request',
        blurb: (
          <div>
            You will receive an email when this request has completed the review process.
          </div>
        ),
      },
    } as { [key in STATUS]: { color: string; tag: string; blurb: ReactNode } };

    return (
      <div className="ProfilePending">
        <div className="ProfilePending-block">
          <Link to={`/ccrs/${ccrId}`} className="ProfilePending-title">
            {title} <Tag color={st[status].color}>{st[status].tag}</Tag>
          </Link>
          <div className={`ProfilePending-status is-${status.toLowerCase()}`}>
            {st[status].blurb}
          </div>
        </div>
        <div className="ProfilePending-block is-actions">
          {CCRSTATUS.REJECTED === status && (
            <Link to={`/ccrs/${ccrId}/edit`}>
              <Button disabled={isDisableActions} type="primary">
                Edit
              </Button>
            </Link>
          )}

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
  },
)(ProfilePendingCCR);
