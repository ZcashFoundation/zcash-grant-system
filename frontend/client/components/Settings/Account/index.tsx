import React from 'react';
import { Divider, message } from 'antd';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import { getUserSettings } from 'api/api';
import ChangeEmail from './ChangeEmail';
import RefundAddress from './RefundAddress';
import TipJarAddress from './TipJarAddress';
import ViewingKey from './TipJarViewKey';
import { UserSettings } from 'types';

interface StateProps {
  userid: number;
}

type Props = StateProps;
interface State {
  userSettings: UserSettings | undefined;
  isFetching: boolean;
  errorFetching: boolean;
};

const STATE: State = {
  userSettings: undefined,
  isFetching: false,
  errorFetching: false,
};

class AccountSettings extends React.Component<Props, State> {
  state: State = { ...STATE };

  componentDidMount() {
    this.fetchUserSettings();
  }

  render() {
    const { userid } = this.props;
    const { userSettings, isFetching, errorFetching } = this.state;

    return (
      <div className="AccountSettings">
        <ChangeEmail />
        <Divider style={{ margin: '2.5rem 0' }} />
        <RefundAddress
          userSettings={userSettings}
          isFetching={isFetching}
          errorFetching={errorFetching}
          userid={userid}
          onAddressSet={this.handleRefundAddressSet}
        />
        <Divider style={{ margin: '2.5rem 0' }} />
        <TipJarAddress
          userSettings={userSettings}
          isFetching={isFetching}
          errorFetching={errorFetching}
          userid={userid}
          onAddressSet={this.handleTipJarAddressSet}
        />
        <Divider style={{ margin: '2.5rem 0' }} />
        <ViewingKey
          userSettings={userSettings}
          isFetching={isFetching}
          errorFetching={errorFetching}
          userid={userid}
          onViewKeySet={this.handleTipJarViewKeySet}
        />
      </div>
    );
  }

  private async fetchUserSettings() {
    const { userid } = this.props;
    this.setState({ isFetching: true });
    try {
      const res = await getUserSettings(userid);
      this.setState({ userSettings: res.data || undefined });
    } catch (err) {
      console.error(err);
      message.error('Failed to get user settings');
      this.setState({ errorFetching: true });
    }
    this.setState({ isFetching: false });
  }

  private handleRefundAddressSet = (refundAddress: UserSettings['refundAddress']) => {
    const { userSettings } = this.state;
    if (!userSettings) return;

    this.setState({
      userSettings: {
        ...userSettings,
        refundAddress,
      },
    });
  };

  private handleTipJarAddressSet = (tipJarAddress: UserSettings['tipJarAddress']) => {
    const { userSettings } = this.state;
    if (!userSettings) return;

    this.setState({
      userSettings: {
        ...userSettings,
        tipJarAddress,
      },
    });
  };

  private handleTipJarViewKeySet = (tipJarViewKey: UserSettings['tipJarViewKey']) => {
    const { userSettings } = this.state;
    if (!userSettings) return;

    this.setState({
      userSettings: {
        ...userSettings,
        tipJarViewKey,
      },
    });
  };
}

const withConnect = connect<StateProps, {}, {}, AppState>(state => ({
  userid: state.auth.user ? state.auth.user.userid : 0,
}));

export default withConnect(AccountSettings);
