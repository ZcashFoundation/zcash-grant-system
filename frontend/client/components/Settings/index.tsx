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

interface State {
  tabPosition: 'left' | 'top';
}

class Settings extends React.Component<Props, State> {
  state: State = {
    tabPosition: 'left',
  };

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  render() {
    const { authUser } = this.props;
    if (!authUser) return null;
    const { tabPosition } = this.state;

    return (
      <div className="Settings">
        <LinkableTabs defaultActiveKey="account" tabPosition={tabPosition}>
          <TabPane tab="Account" key="account">
            <Account />
          </TabPane>
          <TabPane tab="Notifications" key="emails">
            <EmailSubscriptions />
          </TabPane>
          <TabPane tab="Change Password" key="password">
            <ChangePassword />
          </TabPane>
        </LinkableTabs>
      </div>
    );
  }

  private handleResize = () => {
    const { tabPosition } = this.state;
    if (tabPosition === 'left' && window.innerWidth < 460) {
      this.setState({ tabPosition: 'top' });
    } else if (tabPosition === 'top' && window.innerWidth >= 460) {
      this.setState({ tabPosition: 'left' });
    }
  };
}

const withConnect = connect<StateProps, {}, {}, AppState>(state => ({
  authUser: state.auth.user,
}));

export default withConnect(Settings);
