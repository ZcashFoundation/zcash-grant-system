import React from 'react';
import { Icon } from 'antd';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import './style.less';

interface OwnProps {
  isTransparent?: boolean;
}

type Props = OwnProps;

export default class Header extends React.Component<Props> {
  render() {
    const { isTransparent } = this.props;
    return (
      <div
        className={classnames({
          Header: true,
          ['is-transparent']: isTransparent,
        })}
      >
        <Link to="/proposals" className="Header-button" style={{ display: 'flex' }}>
          <span className="Header-button-icon">
            <Icon type="appstore" />
          </span>
          <span className="Header-button-text">Explore</span>
        </Link>

        <Link className="Header-title" to="/">
          Grant.io
        </Link>

        <Link to="/create" className="Header-button">
          <span className="Header-button-icon">
            <Icon type="form" />
          </span>
          <span className="Header-button-text">Start a Proposal</span>
        </Link>

        {!isTransparent && <div className="Header-alphaBanner">Alpha</div>}
      </div>
    );
  }
}
