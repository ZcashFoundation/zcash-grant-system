import React from 'react';
import { Link } from 'react-router-dom';
import { withNamespaces, WithNamespaces } from 'react-i18next';
import HomeIllustration from 'static/images/home-illustration.png';
import './Intro.less';

const HomeIntro: React.SFC<WithNamespaces> = ({ t }) => (
  <div className="HomeIntro">
    <div className="HomeIntro-content">
      <h1 className="HomeIntro-content-title">{t('home.intro.title')}</h1>
      <p className="HomeIntro-content-subtitle">{t('home.intro.subtitle')}</p>
      <div className="HomeIntro-content-buttons">
        <Link className="HomeIntro-content-buttons-auth" to="/auth">
          {t('home.intro.signup')}
        </Link>
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

export default withNamespaces()(HomeIntro);
