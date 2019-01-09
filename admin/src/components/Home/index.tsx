import React from 'react';
import { Divider, Icon } from 'antd';
import { view } from 'react-easy-state';
import store from '../../store';
import './index.less';
import { Link } from 'react-router-dom';

class Home extends React.Component {
  componentDidMount() {
    store.fetchStats();
  }

  render() {
    const { userCount, proposalCount, proposalPendingCount } = store.stats;
    return (
      <div className="Home">
        {!!proposalPendingCount && (
          <div className="Home-actionItems">
            <Divider orientation="left">Action Items</Divider>
            <div>
              <Icon type="exclamation-circle" /> There are <b>{proposalPendingCount}</b>{' '}
              proposals waiting for review.{' '}
              <Link to="/proposals?status=PENDING">Click here</Link> to view them.
            </div>
          </div>
        )}

        <Divider orientation="left">Stats</Divider>
        <div>user count: {userCount}</div>
        <div>proposal count: {proposalCount}</div>
      </div>
    );
  }
}

export default view(Home);
