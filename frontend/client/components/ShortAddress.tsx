import React from 'react';
import classnames from 'classnames';
import './ShortAddress.less';

interface Props {
  address: string;
  className?: string;
}

const ShortAddress = ({ address, className }: Props) => (
  <div className={classnames('ShortAddress', className)}>
    <div className="ShortAddress-bookend">{address.substr(0, 7)}</div>
    <div className="ShortAddress-middle">{address.substr(7, address.length - 5)}</div>
    <div className="ShortAddress-bookend">{address.substr(address.length - 5)}</div>
  </div>
);

export default ShortAddress;
