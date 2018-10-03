import React from 'react';
import { TeamMember } from 'modules/create/types';
import UserAvatar from 'components/UserAvatar';
import './ProfileUser.less';
import { SOCIAL_INFO, SocialInfo, socialAccountToUrl } from 'utils/social';
import ShortAddress from 'components/ShortAddress';

interface OwnProps {
  user: TeamMember;
}

export default class Profile extends React.Component<OwnProps> {
  render() {
    const {
      user,
      user: { socialAccounts },
    } = this.props;
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
          <div className="ProfileUser-info-social">
            {Object.values(SOCIAL_INFO).map(
              s =>
                (socialAccounts[s.type] && (
                  <Social key={s.type} account={socialAccounts[s.type]} info={s} />
                )) ||
                null,
            )}
          </div>
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
