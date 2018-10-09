import React from 'react';
import { connect } from 'react-redux';
import { Button, Alert } from 'antd';
import { web3Actions } from 'modules/web3';
import { AppState } from 'store/reducers';
import MetamaskIcon from 'static/images/metamask.png';
import './Web3.less';

interface StateProps {
  accounts: AppState['web3']['accounts'];
  isWeb3Locked: AppState['web3']['isWeb3Locked'];
}

interface DispatchProps {
  setWeb3: typeof web3Actions['setWeb3'];
  setAccounts: typeof web3Actions['setAccounts'];
}

interface OwnProps {
  onSelectAddress(addr: string): void;
}

type Props = StateProps & DispatchProps & OwnProps;

class Web3Provider extends React.Component<Props> {
  componentDidUpdate() {
    const { accounts } = this.props;
    if (accounts && accounts[0]) {
      this.props.onSelectAddress(accounts[0]);
    }
  }

  render() {
    const { isWeb3Locked } = this.props;
    return (
      <div className="Web3Provider">
        <img className="Web3Provider-logo" src={MetamaskIcon} />
        <p className="Web3Provider-description">
          Make sure you have MetaMask or another web3 provider installed and unlocked,
          then click below.
        </p>
        {isWeb3Locked && (
          <Alert
            showIcon
            type="error"
            message="It looks like MetaMask is locked"
            style={{ margin: '1rem auto' }}
          />
        )}
        <Button type="primary" size="large" onClick={this.connect}>
          Connect to Web3
        </Button>
      </div>
    );
  }

  private connect = () => {
    this.props.setWeb3();
    this.props.setAccounts();
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    accounts: state.web3.accounts,
    isWeb3Locked: state.web3.isWeb3Locked,
  }),
  {
    setWeb3: web3Actions.setWeb3,
    setAccounts: web3Actions.setAccounts,
  },
)(Web3Provider);
