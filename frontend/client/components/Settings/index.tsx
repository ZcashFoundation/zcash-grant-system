import React from 'react';
import { AppState } from 'store/reducers';
import { connect } from 'react-redux';
import './index.less';
import { Tabs } from 'antd';
import LinkableTabs from 'components/LinkableTabs';
import ChangePassword from './ChangePassword';

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
        <h1>Settings</h1>
        <LinkableTabs defaultActiveKey="password" tabPosition="top">
          <TabPane tab="Change Password" key="password">
            <ChangePassword />
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
