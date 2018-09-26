import React from 'react';
import './ShortAddress.less';

interface Props {
  address: string;
}

const ShortAddress = ({ address }: Props) => (
  <div className="ShortAddress">
    <div className="ShortAddress-bookend">{address.substr(0, 7)}</div>
    <div className="ShortAddress-middle">{address.substr(7, address.length - 5)}</div>
    <div className="ShortAddress-bookend">{address.substr(address.length - 5)}</div>
  </div>
);

export default ShortAddress;
