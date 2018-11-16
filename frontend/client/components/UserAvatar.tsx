import React from 'react';
import Identicon from 'components/Identicon';
import { User } from 'types';
import defaultUserImg from 'static/images/default-user.jpg';

interface Props {
  user: User;
  className?: string;
}

const UserAvatar: React.SFC<Props> = ({ user, className }) => {
  if (user.avatar && user.avatar.image_url) {
    return <img className={className} src={user.avatar.image_url} />;
  } else if (user.accountAddress) {
    return <Identicon className={className} address={user.accountAddress} />;
  } else {
    return <img className={className} src={defaultUserImg} />;
  }
};

export default UserAvatar;
