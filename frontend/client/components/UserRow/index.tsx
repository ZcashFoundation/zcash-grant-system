import React from 'react';
import UserAvatar from 'components/UserAvatar';
import { User } from 'types';
import { Link } from 'react-router-dom';
import './style.less';

interface Props {
  user: User;
  extra?: React.ReactNode;
}

const UserRow = ({ user, extra }: Props) => (
  <Link to={`/profile/${user.userid}`} className="UserRow">
    <div className="UserRow-avatar">
      <UserAvatar user={user} className="UserRow-avatar-img" />
    </div>
    <div className="UserRow-info">
      <div className="UserRow-info-main">{user.displayName}</div>
      <p className="UserRow-info-secondary">{user.title}</p>
    </div>
    {extra && (
      <div className="UserRow-extra">
        {extra}
      </div>
    )}
  </Link>
);

export default UserRow;
