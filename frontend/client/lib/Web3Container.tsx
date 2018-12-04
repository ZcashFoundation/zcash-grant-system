import React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';

export interface Web3RenderProps {
  accounts: any[];
}

interface OwnProps {
  render(props: Web3RenderProps & { props: any }): React.ReactNode;
  renderLoading(): React.ReactNode;
}

interface StateProps {
  isMissingWeb3: boolean;
  accounts: any[];
}

type Props = OwnProps & StateProps;

class Web3Container extends React.Component<Props> {
  render() {
    const { isMissingWeb3, accounts } = this.props;

    return !isMissingWeb3 && accounts.length
      ? this.props.render({ accounts, props: { ...this.props } })
      : this.props.renderLoading();
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    isMissingWeb3: state.web3.isMissingWeb3,
    accounts: state.web3.accounts,
  };
}

export default connect(mapStateToProps)(Web3Container);
