import React from 'react';
import { Icon, Dropdown, Menu } from 'antd';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import UserAvatar from 'components/UserAvatar';
import Identicon from 'components/Identicon';
import { web3Actions } from 'modules/web3';
import { AppState } from 'store/reducers';
import './Auth.less';

interface StateProps {
  user: AppState['auth']['user'];
  isAuthingUser: AppState['auth']['isAuthingUser'];
  web3: AppState['web3']['web3'];
  accounts: AppState['web3']['accounts'];
  accountsLoading: AppState['web3']['accountsLoading'];
  accountsError: AppState['web3']['accountsError'];
}

interface DispatchProps {
  setWeb3: typeof web3Actions['setWeb3'];
  setAccounts: typeof web3Actions['setAccounts'];
}

type Props = StateProps & DispatchProps;

interface State {
  isMenuOpen: boolean;
}

class HeaderAuth extends React.Component<Props> {
  state: State = {
    isMenuOpen: false,
  };

  componentDidMount() {
    this.props.setWeb3();
  }

  componentDidUpdate() {
    const { web3, accounts, accountsLoading, accountsError } = this.props;
    if (web3 && !accounts.length && !accountsLoading && !accountsError) {
      this.props.setAccounts();
    }
  }

  render() {
    const { accounts, accountsLoading, user, isAuthingUser } = this.props;
    const { isMenuOpen } = this.state;
    const isAuthed = !!user;

    let avatar;
    let isLoading;
    if (user) {
      avatar = <UserAvatar user={user} />;
    } else if (accounts && accounts[0]) {
      avatar = <Identicon address={accounts[0]} />;
    } else if (accountsLoading || isAuthingUser) {
      avatar = '';
      isLoading = true;
    }

    const link = (
      <Link
        to={isAuthed ? '/profile' : '/auth'}
        className={classnames('AuthButton Header-links-link', isLoading && 'is-loading')}
        onClick={isAuthed && this.toggleMenu}
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

    // If they're not authed, don't render the dropdown menu
    if (!isAuthed) {
      return link;
    }

    const menu = (
      <Menu style={{ minWidth: '100px' }}>
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

    return (
      <Dropdown
        overlay={menu}
        visible={isMenuOpen}
        placement="bottomRight"
        onVisibleChange={this.handleVisibilityChange}
        trigger={['click']}
      >
        {link}
      </Dropdown>
    );
  }

  private toggleMenu = (ev?: React.MouseEvent<HTMLAnchorElement>) => {
    if (ev) {
      ev.preventDefault();
    }
    this.setState({ isMenuOpen: !this.state.isMenuOpen });
  };

  private handleVisibilityChange = (visibility: boolean) => {
    // Handle the dropdown component's built in close events
    this.setState({ isMenuOpen: visibility });
  };
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    user: state.auth.user,
    isAuthingUser: state.auth.isAuthingUser,
    web3: state.web3.web3,
    accounts: state.web3.accounts,
    accountsLoading: state.web3.accountsLoading,
    accountsError: state.web3.accountsError,
  }),
  {
    setWeb3: web3Actions.setWeb3,
    setAccounts: web3Actions.setAccounts,
  },
)(HeaderAuth);
