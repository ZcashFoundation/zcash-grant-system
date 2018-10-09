import React from 'react';
import ShortAddress from 'components/ShortAddress';
import Identicon from 'components/Identicon';
import './style.less';

interface Props {
  address: string;
  secondary?: React.ReactNode;
}

const AddressRow = ({ address, secondary }: Props) => (
  <div className="AddressRow">
    <div className="AddressRow-avatar">
      <Identicon address={address} />
    </div>
    <div className="AddressRow-info">
      <div className="AddressRow-info-main">
        <ShortAddress address={address} />
      </div>
      {secondary && <p className="AddressRow-info-secondary">{secondary}</p>}
    </div>
  </div>
);

export default AddressRow;
