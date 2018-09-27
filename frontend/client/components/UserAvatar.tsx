import React from 'react';
import Identicon from 'components/Identicon';
import { TeamMember } from 'modules/create/types';
import defaultUserImg from 'static/images/default-user.jpg';

interface Props {
  user: TeamMember;
  className?: string;
}

const UserAvatar: React.SFC<Props> = ({ user, className }) => {
  if (user.avatarUrl) {
    return <img className={className} src={user.avatarUrl} />;
  } else if (user.ethAddress) {
    return <Identicon className={className} address={user.ethAddress} />;
  } else {
    return <img className={className} src={defaultUserImg} />;
  }
};

export default UserAvatar;
