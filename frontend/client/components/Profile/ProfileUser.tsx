import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { SocialMedia } from 'types';
import { UserState } from 'modules/users/reducers';
import UserAvatar from 'components/UserAvatar';
import { SOCIAL_INFO } from 'utils/social';
import { AppState } from 'store/reducers';
import './ProfileUser.less';

interface OwnProps {
  user: UserState;
}

interface StateProps {
  authUser: AppState['auth']['user'];
}

type Props = OwnProps & StateProps;

class ProfileUser extends React.Component<Props> {
  render() {
    const {
      authUser,
      user,
      user: { socialMedias },
    } = this.props;

    const isSelf = !!authUser && authUser.userid === user.userid;

    return (
      <div className="ProfileUser">
        <div className="ProfileUser-avatar">
          <UserAvatar className="ProfileUser-avatar-img" user={user} />
        </div>
        <div className="ProfileUser-info">
          <div className="ProfileUser-info-name">{user.displayName}</div>
          <div className="ProfileUser-info-title">{user.title}</div>
          <div>
            {user.emailAddress && (
              <div className="ProfileUser-info-address">
                <span>email address</span>
                {user.emailAddress}
              </div>
            )}
          </div>
          {socialMedias.length > 0 && (
            <div className="ProfileUser-info-social">
              {socialMedias.map(sm => (
                <Social key={sm.service} socialMedia={sm} />
              ))}
            </div>
          )}
          {isSelf && (
            <div>
              <Link to={`/profile/${user.userid}/edit`}>
                <Button>Edit profile</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const Social = ({ socialMedia }: { socialMedia: SocialMedia }) => {
  return (
    <a href={socialMedia.url} target="_blank" rel="noopener nofollow">
      <div className="ProfileUser-info-social-icon">
        {SOCIAL_INFO[socialMedia.service].icon}
      </div>
    </a>
  );
};

const connectedProfileUser = connect<StateProps, {}, {}, AppState>(state => ({
  authUser: state.auth.user,
}))(ProfileUser);

export default connectedProfileUser;
