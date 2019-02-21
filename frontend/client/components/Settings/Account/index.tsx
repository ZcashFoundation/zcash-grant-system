import React from 'react';
import { Divider } from 'antd';
import ChangeEmail from './ChangeEmail';
import RefundAddress from './RefundAddress';

export default class AccountSettings extends React.Component<{}> {
  render() {
    return (
      <div className="AccountSettings">
        <ChangeEmail />
        <Divider style={{ margin: '2.5rem 0' }} />
        <RefundAddress />
      </div>
    );
  }
}
