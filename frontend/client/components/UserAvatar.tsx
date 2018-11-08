import React from 'react';
import Identicon from 'components/Identicon';
import { TeamMember, User } from 'types';
import defaultUserImg from 'static/images/default-user.jpg';

interface Props {
  user: TeamMember | User;
  className?: string;
}

function isTeamMember(user: TeamMember | User): user is TeamMember {
  return !!(user as TeamMember).ethAddress;
}

function isUser(user: TeamMember | User): user is User {
  return !!(user as User).accountAddress;
}

const UserAvatar: React.SFC<Props> = ({ user, className }) => {
  let url;
  let address;
  if (isTeamMember(user)) {
    url = user.avatarUrl;
    address = user.ethAddress;
  } else if (isUser(user)) {
    url = user.avatar && user.avatar.imageUrl;
    address = user.accountAddress;
  }

  if (url) {
    return <img className={className} src={url} />;
  } else if (address) {
    return <Identicon className={className} address={address} />;
  } else {
    return <img className={className} src={defaultUserImg} />;
  }
};

export default UserAvatar;
