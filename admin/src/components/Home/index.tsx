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
      proposalMilestonePayoutsCount,
      contributionRefundableCount,
    } = store.stats;

    const actionItems = [
      !!proposalPendingCount && (
        <div>
          <Icon type="exclamation-circle" /> There are <b>{proposalPendingCount}</b>{' '}
          proposals <b>waiting for review</b>.{' '}
          <Link to="/proposals?filters[]=STATUS_PENDING">Click here</Link> to view them.
        </div>
      ),
      !!proposalNoArbiterCount && (
        <div>
          <Icon type="exclamation-circle" /> There are <b>{proposalNoArbiterCount}</b>{' '}
          live proposals <b>without an arbiter</b>.{' '}
          <Link to="/proposals?filters[]=STATUS_LIVE&filters[]=ARBITER_MISSING&filters[]=STAGE_NOT_CANCELED&filters[]=ACCEPTED_WITH_FUNDING">
            Click here
          </Link>{' '}
          to view them.
        </div>
      ),
      !!proposalMilestonePayoutsCount && (
        <div>
          <Icon type="exclamation-circle" /> There are{' '}
          <b>{proposalMilestonePayoutsCount}</b> proposals <b>with approved payouts</b>.{' '}
          <Link to="/proposals?filters[]=MILESTONE_ACCEPTED&filters[]=STAGE_NOT_CANCELED">
            Click here
          </Link>{' '}
          to view them.
        </div>
      ),
      !!contributionRefundableCount && (
        <div>
          <Icon type="exclamation-circle" /> There are{' '}
          <b>{contributionRefundableCount}</b> contributions <b>ready to be refunded</b>.{' '}
          <Link to="/contributions?filters[]=REFUNDABLE">Click here</Link> to view them.
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
