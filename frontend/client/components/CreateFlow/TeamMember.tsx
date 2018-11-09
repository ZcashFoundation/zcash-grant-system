import React from 'react';
import classnames from 'classnames';
import { Icon } from 'antd';
import { SOCIAL_INFO } from 'utils/social';
import { TeamMember } from 'types';
import UserAvatar from 'components/UserAvatar';
import './TeamMember.less';

interface Props {
  index: number;
  user: TeamMember;
  onRemove(index: number): void;
}

export default class CreateFlowTeamMember extends React.PureComponent<Props> {
  render() {
    const { user, index } = this.props;

    return (
      <div className="TeamMember">
        <div className="TeamMember-avatar">
          <UserAvatar className="TeamMember-avatar-img" user={user} />
        </div>
        <div className="TeamMember-info">
          <div className="TeamMember-info-name">{user.name || <em>No name</em>}</div>
          <div className="TeamMember-info-title">{user.title || <em>No title</em>}</div>
          <div className="TeamMember-info-social">
            {Object.values(SOCIAL_INFO).map(s => {
              const account = user.socialAccounts[s.type];
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
          {index !== 0 && (
            <button className="TeamMember-info-remove" onClick={this.removeMember}>
              <Icon type="close-circle" theme="filled" />
            </button>
          )}
        </div>
      </div>
    );
  }

  private removeMember = () => {
    this.props.onRemove(this.props.index);
  };
}
