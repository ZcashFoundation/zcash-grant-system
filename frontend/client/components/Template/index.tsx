import React from 'react';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import classnames from 'classnames';
import BasicHead from 'components/BasicHead';
import Header from 'components/Header';
import Footer from 'components/Footer';
import Web3Error from './Web3Error';
import { web3Actions } from 'modules/web3';
import { AppState } from 'store/reducers';
import MetamaskIcon from 'static/images/metamask.png';
import WrongNetworkIcon from 'static/images/wrong-network.png';
import './index.less';

interface StateProps {
  isMissingWeb3: boolean;
  isWeb3Locked: boolean;
  isWrongNetwork: boolean;
}

interface DispatchProps {
  setAccounts: typeof web3Actions['setAccounts'];
}

export interface TemplateProps {
  title: string;
  isHeaderTransparent?: boolean;
  isFullScreen?: boolean;
  hideFooter?: boolean;
  requiresWeb3?: boolean;
}

type Props = StateProps & DispatchProps & TemplateProps;

class Template extends React.PureComponent<Props> {
  render() {
    const {
      children,
      title,
      isHeaderTransparent,
      isFullScreen,
      hideFooter,
      requiresWeb3,
      isMissingWeb3,
      isWeb3Locked,
      isWrongNetwork,
    } = this.props;

    let content = children;
    let isCentered = false;
    if (requiresWeb3) {
      if (isMissingWeb3) {
        isCentered = true;
        content = (
          <Web3Error
            icon={MetamaskIcon}
            message={`
              This page requires a web3 client to use. Either unlock or install the
              MetaMask browser extension and refresh to continue.
            `}
            button={{
              text: 'Get MetaMask',
              href: 'https://metamask.io/',
            }}
          />
        );
      } else if (isWeb3Locked) {
        isCentered = true;
        content = (
          <Web3Error
            icon={MetamaskIcon}
            message={`
              It looks like your MetaMask account is locked. Please unlock it and click the
              button below to continue.
            `}
            button={{
              text: 'Try again',
              onClick: this.props.setAccounts,
            }}
          />
        );
      } else if (isWrongNetwork) {
        isCentered = true;
        content = (
          <Web3Error
            icon={WrongNetworkIcon}
            message={
              <>
                The Grant.io smart contract is currently only supported on the{' '}
                <strong>Ropsten</strong> network. Please change your network to continue.
              </>
            }
          />
        );
      } else {
        content = children;
      }
    }

    const className = classnames(
      'Template',
      isFullScreen && 'is-fullscreen',
      isCentered && 'is-centered',
    );
    return (
      <BasicHead title={title}>
        <div className={className}>
          <Header isTransparent={isHeaderTransparent} />
          <Layout.Content className="Template-content">
            <div className="Template-content-inner">{content}</div>
          </Layout.Content>
          {!hideFooter && <Footer />}
        </div>
      </BasicHead>
    );
  }
}

export default connect<StateProps, DispatchProps, TemplateProps, AppState>(
  state => ({
    isMissingWeb3: state.web3.isMissingWeb3,
    isWeb3Locked: state.web3.isWeb3Locked,
    isWrongNetwork: state.web3.isWrongNetwork,
  }),
  {
    setAccounts: web3Actions.setAccounts,
  },
)(Template);
