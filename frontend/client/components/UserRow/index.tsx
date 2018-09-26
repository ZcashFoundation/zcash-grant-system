import React from 'react';
import ShortAddress from 'components/ShortAddress';
import Identicon from 'components/Identicon';
import './style.less';

interface Props {
  address: string;
  secondary?: React.ReactNode;
}

const UserRow = ({ address, secondary }: Props) => (
  <div className="UserRow">
    <div className="UserRow-avatar">
      <Identicon address={address} />
    </div>
    <div className="UserRow-info">
      <div className="UserRow-info-main">
        <ShortAddress address={address} />
      </div>
      {secondary && <p className="UserRow-info-secondary">{secondary}</p>}
    </div>
  </div>
);

export default UserRow;
