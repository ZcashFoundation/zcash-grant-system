import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'antd';
import { SocialInfo } from 'types';
import { usersActions } from 'modules/users';
import { UserState } from 'modules/users/reducers';
import { typedKeys } from 'utils/ts';
import ProfileEdit from './ProfileEdit';
import UserAvatar from 'components/UserAvatar';
import { SOCIAL_INFO, socialAccountToUrl } from 'utils/social';
import ShortAddress from 'components/ShortAddress';
import './ProfileUser.less';
import { AppState } from 'store/reducers';

interface OwnProps {
  user: UserState;
}

interface StateProps {
  authUser: AppState['auth']['user'];
}

interface DispatchProps {
  updateUser: typeof usersActions['updateUser'];
}

interface State {
  isEditing: boolean;
}

type Props = OwnProps & StateProps & DispatchProps;

class ProfileUser extends React.Component<Props> {
  state: State = {
    isEditing: false,
  };

  render() {
    const {
      authUser,
      user,
      user: { socialAccounts },
    } = this.props;

    const isSelf = !!authUser && authUser.ethAddress === user.ethAddress;

    if (this.state.isEditing) {
      return (
        <ProfileEdit
          user={user}
          onDone={() => this.setState({ isEditing: false })}
          onEdit={this.props.updateUser}
        />
      );
    }

    return (
      <div className="ProfileUser">
        <div className="ProfileUser-avatar">
          <UserAvatar className="ProfileUser-avatar-img" user={user} />
        </div>
        <div className="ProfileUser-info">
          <div className="ProfileUser-info-name">{user.name}</div>
          <div className="ProfileUser-info-title">{user.title}</div>
          <div>
            {user.emailAddress && (
              <div className="ProfileUser-info-address">
                <span>email address</span>
                {user.emailAddress}
              </div>
            )}
            {user.ethAddress && (
              <div className="ProfileUser-info-address">
                <span>ethereum address</span>
                <ShortAddress address={user.ethAddress} />
              </div>
            )}
          </div>
          {Object.keys(socialAccounts).length > 0 && (
            <div className="ProfileUser-info-social">
              {typedKeys(SOCIAL_INFO).map(
                s =>
                  (socialAccounts[s] && (
                    <Social
                      key={s}
                      account={socialAccounts[s] as string}
                      info={SOCIAL_INFO[s]}
                    />
                  )) ||
                  null,
              )}
            </div>
          )}
          {isSelf && (
            <div>
              <Button onClick={() => this.setState({ isEditing: true })}>
                Edit profile
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const Social = ({ account, info }: { account: string; info: SocialInfo }) => {
  return (
    <a href={socialAccountToUrl(account, info.type)}>
      <div className="ProfileUser-info-social-icon">{info.icon}</div>
    </a>
  );
};

const connectedProfileUser = connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    authUser: state.auth.user,
  }),
  {
    updateUser: usersActions.updateUser,
  },
)(ProfileUser);

export default connectedProfileUser;
