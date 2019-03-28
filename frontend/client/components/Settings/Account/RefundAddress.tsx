import React from 'react';
import { connect } from 'react-redux';
import { Form, Input, Button, message } from 'antd';
import { AppState } from 'store/reducers';
import { updateUserSettings, getUserSettings } from 'api/api';
import { isValidAddress } from 'utils/validators';

interface StateProps {
  userid: number;
}

type Props = StateProps;

const STATE = {
  refundAddress: '',
  isFetching: false,
  isSaving: false,
};

type State = typeof STATE;

class RefundAddress extends React.Component<Props, State> {
  state: State = { ...STATE };

  componentDidMount() {
    this.fetchRefundAddress();
  }

  render() {
    const { refundAddress, isFetching, isSaving } = this.state;

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
            value={refundAddress}
            placeholder="Z or T address"
            onChange={this.handleChange}
            disabled={isFetching || isSaving}
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
          Change refund address
        </Button>
      </Form>
    );
  }

  private async fetchRefundAddress() {
    const { userid } = this.props;
    this.setState({ isFetching: true });
    try {
      const res = await getUserSettings(userid);
      this.setState({ refundAddress: res.data.refundAddress || '' });
    } catch (err) {
      console.error(err);
      message.error('Failed to get refund address');
    }
    this.setState({ isFetching: false });
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
      this.setState({ refundAddress: res.data.refundAddress || '' });
    } catch (err) {
      console.error(err);
      message.error(err.message || err.toString(), 5);
    }
    this.setState({ isSaving: false });
  };
}

const withConnect = connect<StateProps, {}, {}, AppState>(state => ({
  userid: state.auth.user ? state.auth.user.userid : 0,
}));

export default withConnect(RefundAddress);
