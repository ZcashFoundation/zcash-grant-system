import React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
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

type Props = OwnProps & StateProps;

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
                <a onClick={() => null}>click here to continue</a>.
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

export default connect<StateProps, {}, OwnProps, AppState>(state => {
  console.warn('TODO - convert to LoginRequiredButton?', state);
  return {
    isMissingWeb3: false,
    isWeb3Locked: false,
    isWrongNetwork: false,
  };
})(MetaMaskRequiredButton);
