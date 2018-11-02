import React from 'react';
import { view } from 'react-easy-state';
import store from '../../store';
import './index.less';

class Home extends React.Component {
  componentDidMount() {
    store.fetchStats();
  }

  render() {
    const { userCount, proposalCount } = store.stats;
    return (
      <div className="Home">
        <h1>Home</h1>
        <div>isLoggedIn: {JSON.stringify(store.isLoggedIn)}</div>
        <div>web3 enabled: {JSON.stringify(store.web3Enabled)}</div>
        <div>web3 type: {store.web3Type}</div>
        <div>ethereum network: {store.ethNetId}</div>
        <div>ethereum account: {store.ethAccount}</div>
        <div>CrowdFundFactory: {store.crowdFundFactoryDefinitionStatus}</div>
        {userCount > -1 && (
          <>
            <div>user count: {userCount}</div>
            <div>proposal count: {proposalCount}</div>
          </>
        )}
      </div>
    );
  }
}

export default view(Home);
