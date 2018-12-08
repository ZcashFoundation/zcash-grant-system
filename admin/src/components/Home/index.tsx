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
        <div>user count: {userCount}</div>
        <div>proposal count: {proposalCount}</div>
      </div>
    );
  }
}

export default view(Home);
