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
    const {
      userCount,
      proposalCount,
      proposalPendingCount,
      proposalNoArbiterCount,
    } = store.stats;

    const actionItems = [
      !!proposalPendingCount && (
        <div>
          <Icon type="exclamation-circle" /> There are <b>{proposalPendingCount}</b>{' '}
          proposals <b>waiting for review</b>.{' '}
          <Link to="/proposals?status=PENDING">Click here</Link> to view them.
        </div>
      ),
      !!proposalNoArbiterCount && (
        <div>
          <Icon type="exclamation-circle" /> There are <b>{proposalNoArbiterCount}</b>{' '}
          live proposals <b>without an arbitor</b>. No one can approve their payout
          requests! <Link to="/proposals?status=LIVE&arbiter=false">Click here</Link> to
          view them.
        </div>
      ),
    ].filter(Boolean);

    return (
      <div className="Home">
        {!!actionItems.length && (
          <div className="Home-actionItems">
            <Divider orientation="left">Action Items</Divider>
            {actionItems.map((ai, i) => (
              <div key={i}>{ai}</div>
            ))}
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
