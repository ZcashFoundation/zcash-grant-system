import React from 'react';
import { Link } from 'react-router-dom';
import { withNamespaces, WithNamespaces } from 'react-i18next';
import './Actions.less';

const HomeActions: React.SFC<WithNamespaces> = ({ t }) => (
  <div className="HomeActions">
    <h2 className="HomeActions-title">{t('home.actions.title')}</h2>
    <div className="HomeActions-buttons">
      <Link className="HomeActions-buttons-button is-light" to="/proposals">
        {t('home.actions.proposals')}
      </Link>
      <Link className="HomeActions-buttons-button is-dark" to="/requests">
        {t('home.actions.requests')}
      </Link>
    </div>
  </div>
);

export default withNamespaces()(HomeActions);
