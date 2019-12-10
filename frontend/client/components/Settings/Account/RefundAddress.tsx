import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { updateUserSettings } from 'api/api';
import { isValidAddress } from 'utils/validators';
import { UserSettings } from 'types';

interface Props {
  userSettings?: UserSettings;
  isFetching: boolean;
  errorFetching: boolean;
  userid: number;
  onAddressSet: (refundAddress: UserSettings['refundAddress']) => void;
}

interface State {
  isSaving: boolean;
  refundAddress: string | null;
  refundAddressSet: string | null;
}

export default class RefundAddress extends React.Component<Props, State> {
  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    const { userSettings } = nextProps;
    const { refundAddress, refundAddressSet } = prevState;

    const ret: Partial<State> = {};

    if (!userSettings || !userSettings.refundAddress) {
      return ret;
    }

    if (userSettings.refundAddress !== refundAddressSet) {
      ret.refundAddressSet = userSettings.refundAddress;

      if (refundAddress === null) {
        ret.refundAddress = userSettings.refundAddress;
      }
    }

    return ret;
  }

  state: State = {
    isSaving: false,
    refundAddress: null,
    refundAddressSet: null,
  };

  render() {
    const { isSaving, refundAddress, refundAddressSet } = this.state;
    const { isFetching, errorFetching } = this.props;
    const addressChanged = refundAddress !== refundAddressSet;

    let status: 'validating' | 'error' | undefined;
    let help;
    if (isFetching) {
      status = 'validating';
    } else if (refundAddress && !isValidAddress(refundAddress)) {
      status = 'error';
      help = 'That doesn’t look like a valid address';
    }

    return (
      <Form className="RefundAddress" layout="vertical" onSubmit={this.handleSubmit}>
        <Form.Item label="Refund address" validateStatus={status} help={help}>
          <Input
            value={refundAddress || ''}
            placeholder="Z address"
            onChange={this.handleChange}
            disabled={isFetching || isSaving || errorFetching}
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          disabled={
            !refundAddress || isSaving || !!status || errorFetching || !addressChanged
          }
          loading={isSaving}
          block
        >
          Change refund address
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
      const res = await updateUserSettings(userid, { refundAddress });
      message.success('Settings saved');
      const refundAddressNew = res.data.refundAddress || '';
      this.setState({ refundAddress: refundAddressNew });
      this.props.onAddressSet(refundAddressNew);
    } catch (err) {
      console.error(err);
      message.error(err.message || err.toString(), 5);
    }
    this.setState({ isSaving: false });
  };
}
