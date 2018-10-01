import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { Spin, Icon } from 'antd';
import Identicon from 'components/Identicon';
import { web3Actions } from 'modules/web3';
import { AppState } from 'store/reducers';
import './style.less';

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

interface OwnProps {
  isTransparent?: boolean;
}

type Props = StateProps & DispatchProps & OwnProps;

class Header extends React.Component<Props> {
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
    const { isTransparent, accounts, accountsLoading, user, isAuthingUser } = this.props;
    const isAuthed = !!user;

    let avatar;
    if (user) {
      // TODO: Load user's avatar as well
      avatar = <Identicon address={user.address} />;
    } else if (accounts && accounts[0]) {
      avatar = <Identicon address={accounts[0]} />;
    } else if (accountsLoading || isAuthingUser) {
      avatar = <Spin />;
    }

    return (
      <div
        className={classnames({
          Header: true,
          ['is-transparent']: isTransparent,
        })}
      >
        <div className="Header-links is-left">
          <Link to="/proposals" className="Header-links-link">
            Browse
          </Link>
          <Link to="/create" className="Header-links-link">
            Start a Proposal
          </Link>
        </div>

        <Link className="Header-title" to="/">
          Grant.io
        </Link>

        <div className="Header-links is-right">
          <Link
            to={isAuthed ? '/profile' : '/auth'}
            className="Header-links-link AuthButton"
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
        </div>

        {!isTransparent && <div className="Header-alphaBanner">Alpha</div>}
      </div>
    );
  }
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
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
)(Header);
