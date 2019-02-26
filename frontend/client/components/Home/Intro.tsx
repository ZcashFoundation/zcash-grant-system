import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withNamespaces, WithNamespaces } from 'react-i18next';
import HomeIllustration from 'static/images/home-illustration.png';
import { AppState } from 'store/reducers';
import './Intro.less';

interface StateProps {
  authUser: AppState['auth']['user'];
}

type Props = StateProps & WithNamespaces;

const HomeIntro: React.SFC<Props> = ({ t, authUser }) => (
  <div className="HomeIntro">
    <div className="HomeIntro-content">
      <h1 className="HomeIntro-content-title">{t('home.intro.title')}</h1>
      <p className="HomeIntro-content-subtitle">{t('home.intro.subtitle')}</p>
      <div className="HomeIntro-content-buttons">
        {authUser ? (
          <Link className="HomeIntro-content-buttons-main" to="/proposals">
            {t('home.intro.browse')}
          </Link>
        ) : (
          <Link className="HomeIntro-content-buttons-main" to="/auth">
            {t('home.intro.signup')}
          </Link>
        )}
        <a className="HomeIntro-content-buttons-learn" href="#home-guide">
          {t('home.intro.learn')}
        </a>
      </div>
    </div>
    <div className="HomeIntro-illustration">
      <img src={HomeIllustration} />
    </div>
  </div>
);

export default connect<StateProps, {}, {}, AppState>(
  state => ({ authUser: state.auth.user }),
)(withNamespaces()(HomeIntro));
