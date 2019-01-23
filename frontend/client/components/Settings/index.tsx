import React from 'react';
import { AppState } from 'store/reducers';
import { connect } from 'react-redux';
import './index.less';
import { Tabs } from 'antd';
import LinkableTabs from 'components/LinkableTabs';
import Account from './Account';
import ChangePassword from './ChangePassword';
import EmailSubscriptions from './EmailSubscriptions';

const { TabPane } = Tabs;

interface StateProps {
  authUser: AppState['auth']['user'];
}

type Props = StateProps;

class Settings extends React.Component<Props> {
  render() {
    const { authUser } = this.props;
    if (!authUser) return null;

    return (
      <div className="Settings">
        <LinkableTabs defaultActiveKey="account" tabPosition="left">
          <TabPane tab="Account" key="account">
            <Account />
          </TabPane>
          <TabPane tab="Change Password" key="password">
            <ChangePassword />
          </TabPane>
          <TabPane tab="Notifications" key="emails">
            <EmailSubscriptions />
          </TabPane>
        </LinkableTabs>
      </div>
    );
  }
}

const withConnect = connect<StateProps, {}, {}, AppState>(state => ({
  authUser: state.auth.user,
}));

export default withConnect(Settings);
