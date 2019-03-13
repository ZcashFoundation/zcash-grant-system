import React from 'react';
import { Form, Input, Button, message, Alert, Divider } from 'antd';
import { updateUserSettings } from 'api/api';
import { isValidAddress } from 'utils/validators';
import './SetRefundAddress.less';

interface OwnProps {
  userid: number;
  onSetRefundAddress(): void;
  onSetNoRefund(): void;
}

type Props = OwnProps;

const STATE = {
  refundAddress: '',
  isSaving: false,
};

type State = typeof STATE;

export default class SetRefundAddress extends React.Component<Props, State> {
  state: State = { ...STATE };

  render() {
    const { refundAddress, isSaving } = this.state;

    let status: 'validating' | 'error' | undefined;
    let help;
    if (refundAddress && !isValidAddress(refundAddress)) {
      status = 'error';
      help = 'That doesn’t look like a valid address';
    }

    return (
      <Form className="SetRefundAddress" layout="vertical" onSubmit={this.handleSubmit}>
        <Alert
          type="info"
          message="Please set a refund address"
          description={`
            If the proposal fails to reach its funding goal or gets
            canceled, we need an address to refund your contribution to.
            You’ll only need to set this once, and can change it later from
            the Settings page.
          `}
        />

        <Form.Item label="Refund address" validateStatus={status} help={help}>
          <Input
            value={refundAddress}
            placeholder="Z or T address"
            size="large"
            onChange={this.handleChange}
            disabled={isSaving}
            autoFocus
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          disabled={!refundAddress || isSaving || !!status}
          loading={isSaving}
          block
        >
          Set refund address & continue
        </Button>

        <Divider>or</Divider>

        <Button type="danger" block onClick={this.props.onSetNoRefund}>
          I don't want a refund, consider it a donation instead
        </Button>
      </Form>
    );
  }

  private handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ refundAddress: ev.currentTarget.value });
  };

  private handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const { userid } = this.props;
    const { refundAddress } = this.state;
    if (!refundAddress) {
      return;
    }

    this.setState({ isSaving: true });
    try {
      await updateUserSettings(userid, { refundAddress });
      this.props.onSetRefundAddress();
    } catch (err) {
      console.error(err);
      message.error(err.message || err.toString(), 5);
      this.setState({ isSaving: false });
    }
  };
}
