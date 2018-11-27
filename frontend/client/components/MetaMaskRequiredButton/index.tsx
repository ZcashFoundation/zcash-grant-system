import React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import { web3Actions } from 'modules/web3';
import { Alert } from 'antd';
import metaMaskImgSrc from 'static/images/metamask.png';
import './index.less';

interface OwnProps {
  message: React.ReactNode;
}

interface StateProps {
  isMissingWeb3: boolean;
  isWeb3Locked: boolean;
  isWrongNetwork: boolean;
}

interface DispatchProps {
  setAccounts: typeof web3Actions['setAccounts'];
}

type Props = OwnProps & StateProps & DispatchProps;

class MetaMaskRequiredButton extends React.PureComponent<Props> {
  render() {
    const { isMissingWeb3, isWeb3Locked, isWrongNetwork, children, message } = this.props;
    const displayMessage =
      ((isMissingWeb3 || isWeb3Locked || isWrongNetwork) && message) || null;
    return (
      <>
        {displayMessage}
        {isMissingWeb3 ? (
          <a
            className="MetaMaskRequiredButton"
            href="https://metamask.io/"
            target="_blank"
            rel="noopener nofollow"
          >
            <div className="MetaMaskRequiredButton-logo">
              <img src={metaMaskImgSrc} />
            </div>
            MetaMask required
          </a>
        ) : isWeb3Locked ? (
          <Alert
            type="warning"
            message={
              <>
                It looks like your MetaMask account is locked. Please unlock it and{' '}
                <a onClick={this.props.setAccounts}>click here to continue</a>.
              </>
            }
          />
        ) : isWrongNetwork ? (
          <Alert
            type="warning"
            message={
              <>
                The Grant.io smart contract is currently only supported on the{' '}
                <strong>Ropsten</strong> network. Please change your network to continue.
              </>
            }
          />
        ) : (
          children
        )}
      </>
    );
  }
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    isMissingWeb3: state.web3.isMissingWeb3,
    isWeb3Locked: state.web3.isWeb3Locked,
    isWrongNetwork: state.web3.isWrongNetwork,
  }),
  {
    setAccounts: web3Actions.setAccounts,
  },
)(MetaMaskRequiredButton);
