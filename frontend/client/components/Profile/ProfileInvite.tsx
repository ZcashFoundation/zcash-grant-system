import React from 'react';
import { connect } from 'react-redux';
import { Button, Popconfirm, message } from 'antd';
import { respondToInvite } from 'modules/users/actions';
import { TeamInviteWithResponse } from 'modules/users/reducers';
import './ProfileInvite.less';

interface DispatchProps {
  respondToInvite: typeof respondToInvite;
}

interface OwnProps {
  userId: string | number;
  invite: TeamInviteWithResponse;
}

type Props = DispatchProps & OwnProps;

interface State {
  isAccepting: boolean;
  isRejecting: boolean;
}

class ProfileInvite extends React.Component<Props, State> {
  state: State = {
    isAccepting: false,
    isRejecting: false,
  };

  componentDidUpdate(prevProps: Props) {
    const { invite } = this.props;
    if (prevProps.invite !== invite && invite.respondError) {
      this.setState({
        isAccepting: false,
        isRejecting: false,
      });
      message.error('Failed to respond to invitation', 3);
    }
  }

  render() {
    const { invite } = this.props;
    const { isAccepting, isRejecting } = this.state;
    const { proposal } = invite;
    const inviter = proposal.team[0] || { displayName: 'Unknown user' };
    return (
      <div className="ProfileInvite">
        <div className="ProfileInvite-info">
          <div className="ProfileInvite-info-title">
            {proposal.title || <em>No title</em>}
          </div>
          <div className="ProfileInvite-info-brief">
            {proposal.brief || <em>No description</em>}
          </div>
          <div className="ProfileInvite-info-inviter">
            created by {inviter.displayName}
          </div>
        </div>
        <div className="ProfileInvite-actions">
          <Button
            icon="check"
            type="primary"
            size="large"
            ghost
            onClick={this.accept}
            disabled={isRejecting}
            loading={isAccepting}
          />
          <Popconfirm title="Are you sure?" onConfirm={this.reject}>
            <Button
              icon="close"
              type="danger"
              size="large"
              ghost
              disabled={isAccepting}
              loading={isRejecting}
            />
          </Popconfirm>
        </div>
      </div>
    );
  }

  private accept = () => {
    const { userId, invite } = this.props;
    this.setState({ isAccepting: true });
    this.props.respondToInvite(userId, invite.id, true);
  };

  private reject = () => {
    const { userId, invite } = this.props;
    this.setState({ isRejecting: true });
    this.props.respondToInvite(userId, invite.id, false);
  };
}

export default connect<{}, DispatchProps, OwnProps, {}>(
  undefined,
  { respondToInvite },
)(ProfileInvite);
