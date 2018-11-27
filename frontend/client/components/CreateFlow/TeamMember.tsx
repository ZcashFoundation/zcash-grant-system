import React from 'react';
import classnames from 'classnames';
import { Icon } from 'antd';
import { SOCIAL_INFO } from 'utils/social';
import { User } from 'types';
import UserAvatar from 'components/UserAvatar';
import './TeamMember.less';

interface Props {
  user: User;
}

export default class CreateFlowTeamMember extends React.PureComponent<Props> {
  render() {
    const { user } = this.props;

    return (
      <div className="TeamMember">
        <div className="TeamMember-avatar">
          <UserAvatar className="TeamMember-avatar-img" user={user} />
        </div>
        <div className="TeamMember-info">
          <div className="TeamMember-info-name">
            {user.displayName || <em>No name</em>}
          </div>
          <div className="TeamMember-info-title">{user.title || <em>No title</em>}</div>
          <div className="TeamMember-info-social">
            {Object.values(SOCIAL_INFO).map(s => {
              const account = user.socialMedias.find(sm => s.service === sm.service);
              const cn = classnames(
                'TeamMember-info-social-icon',
                account && 'is-active',
              );
              return (
                <div key={s.name} className={cn}>
                  {s.icon}
                  {account && (
                    <Icon
                      className="TeamMember-info-social-icon-check"
                      type="check-circle"
                      theme="filled"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
