import React from 'react';
import { Form, Button } from 'antd';
import { isValidEthAddress } from 'utils/validators';
import AddressInput from 'components/AddressInput';
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
        <AddressInput
          className="AddressProvider-address"
          value={address}
          onChange={this.handleChange}
          inputProps={{ size: 'large' }}
        />

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
