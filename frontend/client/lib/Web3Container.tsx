import React from 'react';
import Web3 from 'web3';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';

export interface Web3RenderProps {
  web3: Web3;
  accounts: any[];
  contracts: any[];
}

interface OwnProps {
  render(props: Web3RenderProps & { props: any }): React.ReactNode;
  renderLoading(): React.ReactNode;
}

interface StateProps {
  web3: Web3 | null;
  contracts: any[];
  accounts: any[];
}

type Props = OwnProps & StateProps;

class Web3Container extends React.Component<Props> {
  render() {
    const { web3, accounts, contracts } = this.props;

    return web3 && accounts.length && contracts.length
      ? this.props.render({ web3, accounts, contracts, props: { ...this.props } })
      : this.props.renderLoading();
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    web3: state.web3.web3,
    contracts: state.web3.contracts,
    accounts: state.web3.accounts,
  };
}

export default connect(mapStateToProps)(Web3Container);
