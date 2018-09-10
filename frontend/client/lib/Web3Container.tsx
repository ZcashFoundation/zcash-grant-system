import React from 'react';
const CrowdFundFactory = require('./contracts/CrowdFundFactory.json');
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import { web3Actions } from 'modules/web3';

export interface Web3RenderProps {
  web3: any;
  accounts: any[];
  contracts: any[];
}

interface OwnProps {
  render(props: Web3RenderProps & any): React.ReactNode;
  renderLoading(): React.ReactNode;
}

interface StateProps {
  web3: any | null;
  isWeb3Locked: boolean;
  contracts: any[];
  contractsLoading: boolean;
  contractsError: null | string;
  accounts: any[];
  accountsLoading: boolean;
  accountsError: null | string;
}

interface ActionProps {
  setContract(contract: any): void;
  setAccounts(): void;
  setWeb3(): void;
}

type Props = OwnProps & StateProps & ActionProps;

class Web3Container extends React.Component<Props> {
  componentDidUpdate() {
    const {
      web3,
      contracts,
      contractsLoading,
      contractsError,
      accounts,
      accountsLoading,
      accountsError,
      isWeb3Locked,
    } = this.props;
    if (web3 && !contracts.length && !contractsLoading && !contractsError) {
      this.props.setContract(CrowdFundFactory);
    }

    if (web3 && !accounts.length && !accountsLoading && !accountsError && !isWeb3Locked) {
      this.props.setAccounts();
    }
  }

  async componentDidMount() {
    this.props.setWeb3();
  }

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
    isWeb3Locked: state.web3.isWeb3Locked,
    contracts: state.web3.contracts,
    contractsLoading: state.web3.contractsLoading,
    contractsError: state.web3.contractsError,
    accounts: state.web3.accounts,
    accountsLoading: state.web3.accountsLoading,
    accountsError: state.web3.accountsError,
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(web3Actions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Web3Container);
