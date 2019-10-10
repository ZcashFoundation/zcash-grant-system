import React from 'react';
import { connect } from 'react-redux';
import { Drawer, Menu } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import UserAvatar from 'components/UserAvatar';
import { AppState } from 'store/reducers';
import './Drawer.less';

interface StateProps {
  user: AppState['auth']['user'];
}

interface OwnProps {
  isOpen: boolean;
  onClose(): void;
}

type Props = StateProps & OwnProps & RouteComponentProps;

class HeaderDrawer extends React.Component<Props> {
  componentDidMount() {
    window.addEventListener('resize', this.props.onClose);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.props.onClose);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.props.onClose();
    }
  }

  render() {
    const { isOpen, onClose, user, location } = this.props;

    let userTitle: React.ReactNode = 'Account';
    if (user) {
      userTitle = (
        <>
          <UserAvatar className="HeaderDrawer-user-avatar" user={user} />
          My account
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
        <Menu mode="inline" style={{ borderRight: 0 }} selectedKeys={[location.pathname]}>
          <Menu.ItemGroup className="HeaderDrawer-user" title={userTitle}>
            {user
              ? [
                  <Menu.Item key={`/profile/${user.userid}`}>
                    <Link to={`/profile/${user.userid}`}>Profile</Link>
                  </Menu.Item>,
                  <Menu.Item key="/profile/settings">
                    <Link to="/profile/settings">Settings</Link>
                  </Menu.Item>,
                  <Menu.Item key="/auth/sign-out">
                    <Link to="/auth/sign-out">Sign out</Link>
                  </Menu.Item>,
                ]
              : [
                  <Menu.Item key="/auth/sign-in">
                    <Link to="/auth/sign-in">Sign in</Link>
                  </Menu.Item>,
                  <Menu.Item key="/auth/sign-up">
                    <Link to="/auth/sign-up">Create account</Link>
                  </Menu.Item>,
                ]}
          </Menu.ItemGroup>
          <Menu.ItemGroup title="Proposals">
            <Menu.Item key="/proposals">
              <Link to="/proposals">Browse proposals</Link>
            </Menu.Item>
            <Menu.Item key="/create">
              <Link to="/create">Start a proposal</Link>
            </Menu.Item>
          </Menu.ItemGroup>
          <Menu.ItemGroup title="Requests">
            <Menu.Item key="/requests">
              <Link to="/requests">Browse requests</Link>
            </Menu.Item>
          </Menu.ItemGroup>
        </Menu>
      </Drawer>
    );
  }
}

export default connect<StateProps, {}, OwnProps, AppState>(state => ({
  user: state.auth.user,
}))(withRouter(HeaderDrawer));
