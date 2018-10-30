import React from 'react';
import { connect } from 'react-redux';
import { Drawer, Menu } from 'antd';
import { Link } from 'react-router-dom';
import UserAvatar from 'components/UserAvatar';
import Identicon from 'components/Identicon';
import { AppState } from 'store/reducers';
import './Drawer.less';

interface StateProps {
  user: AppState['auth']['user'];
  accounts: AppState['web3']['accounts'];
}

interface OwnProps {
  isOpen: boolean;
  onClose(): void;
}

type Props = StateProps & OwnProps;

class HeaderDrawer extends React.Component<Props> {
  componentDidMount() {
    window.addEventListener('resize', this.props.onClose);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.props.onClose);
  }

  render() {
    const { isOpen, onClose, user, accounts } = this.props;

    let userTitle: React.ReactNode = 'Account';
    if (user) {
      userTitle = (
        <>
          <UserAvatar className="HeaderDrawer-user-avatar" user={user} />
          My account
        </>
      );
    } else if (accounts && accounts[0]) {
      userTitle = (
        <>
          <Identicon className="HeaderDrawer-user-avatar" address={accounts[0]} />
          Account
        </>
      );
    }

    return (
      <Drawer
        className="HeaderDrawer"
        visible={isOpen}
        onClose={onClose}
        placement="left"
      >
        <div className="HeaderDrawer-title">Navigation</div>
        <Menu mode="inline" style={{ borderRight: 0 }}>
          <Menu.ItemGroup className="HeaderDrawer-user" title={userTitle}>
            {user ? (
              [
                <Menu.Item key="profile">
                  <Link to="/profile">Profile</Link>
                </Menu.Item>,
                <Menu.Item key="settings">
                  <Link to="/profile/settings">Settings</Link>
                </Menu.Item>,
                <Menu.Item key="sign-out">
                  <Link to="/auth/sign-out">Sign out</Link>
                </Menu.Item>,
              ]
            ) : (
              <Menu.Item>
                <Link to="/auth">Sign in</Link>
              </Menu.Item>
            )}
          </Menu.ItemGroup>
          <Menu.ItemGroup title="Proposals">
            <Menu.Item>
              <Link to="/proposals">Browse proposals</Link>
            </Menu.Item>
            <Menu.Item>
              <Link to="/create">Start a proposal</Link>
            </Menu.Item>
          </Menu.ItemGroup>
        </Menu>
      </Drawer>
    );
  }
}

export default connect<StateProps, {}, OwnProps, AppState>(state => ({
  user: state.auth.user,
  accounts: state.web3.accounts,
}))(HeaderDrawer);
