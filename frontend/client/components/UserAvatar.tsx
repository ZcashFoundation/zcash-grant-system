import React from 'react';
import { User } from 'types';
import defaultUserImg from 'static/images/default-user.jpg';

interface Props {
  user: User;
  className?: string;
}

const UserAvatar: React.SFC<Props> = ({ user, className }) => {
  if (user.avatar && user.avatar.imageUrl) {
    return <img className={className} src={user.avatar.imageUrl} />;
  } else {
    return <img className={className} src={defaultUserImg} />;
  }
};

export default UserAvatar;
