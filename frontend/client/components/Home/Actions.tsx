import React from 'react';
import { Link } from 'react-router-dom';
import copy from './copy';
import './Actions.less';

const HomeActions: React.SFC<{}> = () => (
  <div className="HomeActions">
    <h2 className="HomeActions-title">{copy.actionsTitle}</h2>
    <div className="HomeActions-buttons">
      <Link className="HomeActions-buttons-button is-light" to="/proposals">
        Browse proposals
      </Link>
      <Link className="HomeActions-buttons-button is-dark" to="/requests">
        See all requests
      </Link>
    </div>
  </div>
);

export default HomeActions;
