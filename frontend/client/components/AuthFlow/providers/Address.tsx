import React from 'react';
import { Form, Input, Button } from 'antd';
import { isValidEthAddress } from 'utils/validators';
import './Address.less';

interface Props {
  onSelectAddress(addr: string): void;
}

interface State {
  address: string;
}

export default class AddressProvider extends React.Component<Props, State> {
  state: State = {
    address: '',
  };

  render() {
    const { address } = this.state;
    return (
      <Form className="AddressProvider" onSubmit={this.handleSubmit}>
        <Form.Item className="AddressProvider-address">
          <Input
            size="large"
            value={address}
            onChange={this.handleChange}
            placeholder="0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520"
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          disabled={!isValidEthAddress(address)}
          block
        >
          Continue
        </Button>
      </Form>
    );
  }

  private handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ address: ev.currentTarget.value });
  };

  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    this.props.onSelectAddress(this.state.address);
  };
}
