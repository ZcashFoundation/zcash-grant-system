import React from 'react';
import { Link } from 'react-router-dom';
import { withNamespaces, WithNamespaces } from 'react-i18next';
import HeaderDetails from 'components/HeaderDetails';
import Rocket from 'static/images/rocket.svg';
import './style.less';

class Home extends React.Component<WithNamespaces> {
  render() {
    const { t } = this.props;
    return (
      <div className="Home">
        <HeaderDetails title={t('home.title')} description={t('home.description')} />
        <div className="Home-hero">
          <div className="Home-hero-background">
            <div className="Home-hero-background-planets">
              <div className="Home-hero-background-planets-planet is-small" />
              <div className="Home-hero-background-planets-planet is-large" />
            </div>
            <Rocket className="Home-hero-background-rocket" />
          </div>

          <div className="Home-hero-inner">
            <h1 className="Home-hero-title">
              {t('home.heroTitle1')} <br /> {t('home.heroTitle2')}
            </h1>

            <div className="Home-hero-buttons">
              <Link className="Home-hero-buttons-button is-primary" to="/create">
                {t('home.createButton')}
              </Link>
              <Link className="Home-hero-buttons-button" to="/proposals">
                {t('home.exploreButton')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withNamespaces()(Home);
