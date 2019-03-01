import React from 'react';
import UserAvatar from 'components/UserAvatar';
import { User } from 'types';
import { Link } from 'react-router-dom';
import './style.less';

interface Props {
  user: User;
  extra?: React.ReactNode;
}

const Wrap = ({ user, children }: { user: User; children: React.ReactNode }) => {
  if (user.userid) {
    return (
      <Link to={`/profile/${user.userid}`} className="UserRow" children={children} />
    );
  } else {
    return <div className="UserRow" children={children} />;
  }
};

const UserRow = ({ user, extra }: Props) => (
  <Wrap user={user}>
    <div className="UserRow-avatar">
      <UserAvatar user={user} className="UserRow-avatar-img" />
    </div>
    <div className="UserRow-info">
      <div className="UserRow-info-main">{user.displayName}</div>
      <p className="UserRow-info-secondary">{user.title}</p>
    </div>
    {extra && <div className="UserRow-extra">{extra}</div>}
  </Wrap>
);

export default UserRow;
