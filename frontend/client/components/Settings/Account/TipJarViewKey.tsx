import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { updateUserSettings } from 'api/api';
import { UserSettings } from 'types';

interface Props {
  userSettings?: UserSettings;
  isFetching: boolean;
  errorFetching: boolean;
  userid: number;
  onViewKeySet: (viewKey: UserSettings['tipJarViewKey']) => void;
}

interface State {
  isSaving: boolean;
  tipJarViewKey: string | null;
  tipJarViewKeySet: string | null;
}

export default class TipJarViewKey extends React.Component<Props, State> {
  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    const { userSettings } = nextProps;
    const { tipJarViewKey, tipJarViewKeySet } = prevState;

    const ret: Partial<State> = {};

    if (!userSettings || userSettings.tipJarViewKey === undefined) {
      return ret;
    }

    if (userSettings.tipJarViewKey !== tipJarViewKeySet) {
      ret.tipJarViewKeySet = userSettings.tipJarViewKey;

      if (tipJarViewKey === null) {
        ret.tipJarViewKey = userSettings.tipJarViewKey;
      }
    }

    return ret;
  }

  state: State = {
    isSaving: false,
    tipJarViewKey: null,
    tipJarViewKeySet: null,
  };

  render() {
    const { isSaving, tipJarViewKey, tipJarViewKeySet } = this.state;
    const { isFetching, errorFetching, userSettings } = this.props;
    const viewKeyChanged = tipJarViewKey !== tipJarViewKeySet;
    const viewKeyDisabled = !(userSettings && userSettings.tipJarAddress);

    // TODO: add view key validation

    // let status: 'validating' | 'error' | undefined;
    // let help;
    // if (isFetching) {
    // status = 'validating';
    // } else if (tipJarAddress && !isValidAddress(tipJarAddress)) {
    // status = 'error';
    // help = 'That doesn’t look like a valid address';
    // }

    return (
      <Form className="RefundAddress" layout="vertical" onSubmit={this.handleSubmit}>
        <Form.Item label="Tip jar view key">
          <Input
            value={tipJarViewKey || ''}
            placeholder="A view key for your tip jar address (optional)"
            onChange={this.handleChange}
            disabled={viewKeyDisabled || isFetching || isSaving || errorFetching}
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          disabled={
            tipJarViewKey === null ||
            isSaving ||
            !!status ||
            errorFetching ||
            !viewKeyChanged
          }
          loading={isSaving}
          block
        >
          Change tip jar view key
        </Button>
      </Form>
    );
  }

  private handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ tipJarViewKey: ev.currentTarget.value });
  };

  private handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const { userid } = this.props;
    const { tipJarViewKey } = this.state;

    if (tipJarViewKey === null) return;

    this.setState({ isSaving: true });
    try {
      const res = await updateUserSettings(userid, { tipJarViewKey });
      message.success('Settings saved');
      const tipJarViewKeyNew = res.data.tipJarViewKey || '';
      this.setState({ tipJarViewKey: tipJarViewKeyNew });
      this.props.onViewKeySet(tipJarViewKeyNew);
    } catch (err) {
      console.error(err);
      message.error(err.message || err.toString(), 5);
    }
    this.setState({ isSaving: false });
  };
}
