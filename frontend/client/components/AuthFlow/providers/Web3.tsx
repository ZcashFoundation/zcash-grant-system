import React from 'react';
import { connect } from 'react-redux';
import { Button, Alert, Spin } from 'antd';
import { enableWeb3 } from 'modules/web3/actions';
import { AppState } from 'store/reducers';
import MetamaskIcon from 'static/images/metamask.png';
import './Web3.less';

interface StateProps {
  accounts: AppState['web3']['accounts'];
  isEnablingWeb3: AppState['web3']['isEnablingWeb3'];
  accountsLoading: AppState['web3']['accountsLoading'];
  web3EnableError: AppState['web3']['web3EnableError'];
  accountsError: AppState['web3']['accountsError'];
}

interface DispatchProps {
  enableWeb3: typeof enableWeb3;
}

interface OwnProps {
  onSelectAddress(addr: string): void;
}

type Props = StateProps & DispatchProps & OwnProps;

class Web3Provider extends React.Component<Props> {
  componentWillMount() {
    if (!this.props.accounts || !this.props.accounts[0]) {
      this.props.enableWeb3();
    }
  }

  componentDidUpdate() {
    const { accounts } = this.props;
    if (accounts && accounts[0]) {
      this.props.onSelectAddress(accounts[0]);
    }
  }

  render() {
    const {
      isEnablingWeb3,
      accountsLoading,
      web3EnableError,
      accountsError,
    } = this.props;
    const isLoading = isEnablingWeb3 || accountsLoading;
    const error = web3EnableError || accountsError;
    return (
      <div className="Web3Provider">
        {isLoading ? (
          <Spin tip="Connecting..." />
        ) : (
          <>
            <img className="Web3Provider-logo" src={MetamaskIcon} />
            <p className="Web3Provider-description">
              Make sure you have MetaMask or another web3 provider installed and unlocked,
              then click below.
            </p>
            {error && (
              <Alert
                showIcon
                type="error"
                message={error}
                style={{ margin: '1rem auto' }}
              />
            )}
            <Button type="primary" size="large" onClick={this.props.enableWeb3}>
              Connect to Web3
            </Button>
          </>
        )}
      </div>
    );
  }
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    accounts: state.web3.accounts,
    isEnablingWeb3: state.web3.isEnablingWeb3,
    accountsLoading: state.web3.accountsLoading,
    web3EnableError: state.web3.web3EnableError,
    accountsError: state.web3.accountsError,
  }),
  {
    enableWeb3,
  },
)(Web3Provider);
