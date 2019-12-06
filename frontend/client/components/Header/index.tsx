import React from 'react';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import HeaderAuth from './Auth';
import HeaderDrawer from './Drawer';
import MenuIcon from 'static/images/menu.svg';
import Logo from 'static/images/logo-name.svg';
import './style.less';
import { Button } from 'antd';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import { ccrActions } from 'modules/ccr';
import { createActions } from 'modules/create';

import { compose } from 'recompose';
import { withRouter } from 'react-router';
import { fetchCCRDrafts } from 'modules/ccr/actions';
import { fetchDrafts } from 'modules/create/actions';

interface StateProps {
  hasCheckedUser: AppState['auth']['hasCheckedUser'];
  ccrDrafts: AppState['ccr']['drafts'];
  proposalDrafts: AppState['create']['drafts'];
}

interface OwnProps {
  isTransparent?: boolean;
}

interface State {
  isDrawerOpen: boolean;
}

interface DispatchProps {
  fetchCCRDrafts: typeof fetchCCRDrafts;
  fetchDrafts: typeof fetchDrafts;
}

type Props = StateProps & OwnProps & DispatchProps;

class Header extends React.Component<Props, State> {
  state: State = {
    isDrawerOpen: false,
  };

  componentDidMount = () => {
    this.props.fetchCCRDrafts();
    this.props.fetchDrafts();
  };

  render() {
    const { isTransparent, ccrDrafts, proposalDrafts, hasCheckedUser } = this.props;
    const { isDrawerOpen } = this.state;

    return (
      <div
        className={classnames({
          Header: true,
          ['is-transparent']: isTransparent,
        })}
      >
        <div className="Header-inner">
          <div className="Header-links is-left is-desktop">
            <Link to="/proposals" className="Header-links-link">
              Proposals
            </Link>
            <Link to="/requests" className="Header-links-link">
              Requests
            </Link>
          </div>

          <div className="Header-links is-left is-mobile">
            <button className="Header-links-link is-menu" onClick={this.openDrawer}>
              <MenuIcon className="Header-links-link-icon" />
            </button>
          </div>

          <Link className="Header-title" to="/">
            <Logo className="Header-title-logo" />
          </Link>

          {!hasCheckedUser && (ccrDrafts === null || proposalDrafts === null) ? null : (
            <div className="Header-links is-right">
              <div className="Header-links-button is-desktop">
                <Link to="/create">
                  {Array.isArray(proposalDrafts) && proposalDrafts.length > 0 ? (
                    <Button>My Proposals</Button>
                  ) : (
                    <Button>Start a Proposal</Button>
                  )}
                </Link>
              </div>
              <div className="Header-links-button is-desktop">
                <Link to="/create-request">
                  {Array.isArray(ccrDrafts) && ccrDrafts.length > 0 ? (
                    <Button type={'primary'}>My Requests</Button>
                  ) : (
                    <Button type={'primary'}>Create a Request</Button>
                  )}
                </Link>
              </div>

              <HeaderAuth />
            </div>
          )}

          <HeaderDrawer isOpen={isDrawerOpen} onClose={this.closeDrawer} />

          {process.env.TESTNET && (
            <div className="Header-testnet">
              <span>Testnet</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  private openDrawer = () => this.setState({ isDrawerOpen: true });
  private closeDrawer = () => this.setState({ isDrawerOpen: false });
}

const withConnect = connect<StateProps, {}, {}, AppState>(
  (state: AppState) => ({
    hasCheckedUser: state.auth.hasCheckedUser,
    ccrDrafts: state.ccr.drafts,
    proposalDrafts: state.create.drafts,
  }),
  {
    fetchCCRDrafts: ccrActions.fetchCCRDrafts,
    fetchDrafts: createActions.fetchDrafts,
  },
);

export default compose<Props, {}>(
  withRouter,
  withConnect,
)(Header);
