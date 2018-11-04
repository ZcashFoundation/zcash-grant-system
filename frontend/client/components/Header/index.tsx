import React from 'react';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import HeaderAuth from './Auth';
import HeaderDrawer from './Drawer';
import MenuIcon from 'static/images/menu.svg';
import Logo from 'static/images/logo-name.svg';
import './style.less';

interface Props {
  isTransparent?: boolean;
}

interface State {
  isDrawerOpen: boolean;
}

export default class Header extends React.Component<Props, State> {
  state: State = {
    isDrawerOpen: false,
  };

  render() {
    const { isTransparent } = this.props;
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
              Browse
            </Link>
            <Link to="/create" className="Header-links-link">
              Start a Proposal
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

          <div className="Header-links is-right">
            <HeaderAuth />
          </div>

          {!isTransparent && <div className="Header-alphaBanner">Alpha</div>}
          <HeaderDrawer isOpen={isDrawerOpen} onClose={this.closeDrawer} />
        </div>
      </div>
    );
  }

  private openDrawer = () => this.setState({ isDrawerOpen: true });
  private closeDrawer = () => this.setState({ isDrawerOpen: false });
}
