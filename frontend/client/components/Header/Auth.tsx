import React from 'react';
import { Icon, Dropdown, Menu } from 'antd';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import UserAvatar from 'components/UserAvatar';
import { AppState } from 'store/reducers';
import './Auth.less';

interface StateProps {
  user: AppState['auth']['user'];
  isAuthingUser: AppState['auth']['isAuthingUser'];
  isCheckingUser: AppState['auth']['isCheckingUser'];
}

type Props = StateProps;

interface State {
  isMenuOpen: boolean;
}

class HeaderAuth extends React.Component<Props> {
  state: State = {
    isMenuOpen: false,
  };

  render() {
    const { user, isAuthingUser, isCheckingUser } = this.props;
    const { isMenuOpen } = this.state;
    const isAuthed = !!user;

    let avatar;
    let isLoading;
    if (user) {
      avatar = <UserAvatar user={user} />;
    } else if (isAuthingUser || isCheckingUser) {
      isLoading = true;
    }

    const link = (
      <Link
        to={isAuthed ? '/profile' : '/auth'}
        className="Header-links-link"
        onClick={this.toggleMenu}
      >
        {isAuthed ? '' : 'Sign in'}
        {avatar && (
          <div className="AuthButton-avatar">
            {avatar}
            {!isAuthed && (
              <div className="AuthButton-avatar-locked">
                <Icon type="lock" theme="filled" />
              </div>
            )}
          </div>
        )}
      </Link>
    );

    let content;
    if (isAuthed) {
      const menu = (
        <Menu style={{ minWidth: '100px' }} onClick={this.closeMenu}>
          <Menu.Item>
            <Link to="/profile">Profile</Link>
          </Menu.Item>
          <Menu.Item>
            <Link to="/profile/settings">Settings</Link>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item>
            <Link to="/auth/sign-out">Sign out</Link>
          </Menu.Item>
        </Menu>
      );
      content = (
        <Dropdown
          overlay={menu}
          visible={isMenuOpen}
          placement="bottomRight"
          onVisibleChange={this.handleVisibilityChange}
          trigger={['click']}
        >
          {link}
        </Dropdown>
      )
    }
    else {
      content = link;
    }

    return (
      <div className={classnames('AuthButton', isLoading && 'is-loading')}>
        {content}
      </div>
    );
  }

  private toggleMenu = (ev?: React.MouseEvent<HTMLElement>) => {
    if (!this.props.user) {
      return;
    }
    if (ev) {
      ev.preventDefault();
    }
    this.setState({ isMenuOpen: !this.state.isMenuOpen });
  };

  private closeMenu = () => this.setState({ isMenuOpen: false });

  private handleVisibilityChange = (visibility?: boolean) => {
    // Handle the dropdown component's built in close events
    if (visibility) {
      this.setState({ isMenuOpen: visibility });
    }
  };
}

export default connect<StateProps, {}, {}, AppState>(state => ({
  user: state.auth.user,
  isAuthingUser: state.auth.isAuthingUser,
  isCheckingUser: state.auth.isCheckingUser,
}))(HeaderAuth);
