import React from 'react';
import { Link } from 'react-router-dom';
import copy from './copy';
import HomeIllustration from 'static/images/home-illustration.png';
import './Intro.less';

const HomeIntro: React.SFC<{}> = () => (
  <div className="HomeIntro">
    <div className="HomeIntro-content">
      <h1 className="HomeIntro-content-title">{copy.introTitle}</h1>
      <p className="HomeIntro-content-subtitle">{copy.introSubtitle}</p>
      <div className="HomeIntro-content-buttons">
        <Link className="HomeIntro-content-buttons-auth" to="/auth">
          {copy.introSignUp}
        </Link>
        <a className="HomeIntro-content-buttons-learn" href="#home-guide">
          {copy.introLearnMore}
        </a>
      </div>
    </div>
    <div className="HomeIntro-illustration">
      <img src={HomeIllustration} />
    </div>
  </div>
);

export default HomeIntro;
