import React from 'react';
import { Spin } from 'antd';
import Web3Container from 'lib/Web3Container';
import CreateFlow from 'components/CreateFlow';

class ProposalEdit extends React.Component<{}> {
  render() {
    return (
      <Web3Container
        renderLoading={() => <Spin />}
        render={({ accounts }) => <h1>Sup</h1>}
      />
    );
  }
}

export default ProposalEdit;
