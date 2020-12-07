import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'antd';
import { withNamespaces, WithNamespaces } from 'react-i18next';
import ZFGrantsLogo from 'static/images/logo-name-light.svg';
import GrantIoLogo from 'static/images/grantio-logo-name.svg';
import './style.less';

const Footer: React.SFC<WithNamespaces> = ({ t }) => (
  <footer className="Footer">
    <div className="Footer-attribution">
      <div className="Footer-attribution-copyright">
        © {new Date().getFullYear()} Zcash Foundation
      </div>
      <a className="Footer-attribution-grantio" href="https://grant.io/" target="_blank">
        <div className="Footer-attribution-grantio-prefix">
          <span>Powered by</span>
          <div className="Footer-attribution-grantio-prefix-line" />
        </div>
        <GrantIoLogo className="Footer-attribution-grantio-logo" />
      </a>
    </div>
    <div className="Footer-main">
      <Link className="Footer-main-title" to="/">
        <ZFGrantsLogo className="Footer-main-title-logo" />
      </Link>
      <p className="Footer-main-about">{t('site.description')}</p>
      <div className="Footer-main-links">
        <a
          href="https://www.zfnd.org/about/"
          className="Footer-main-links-link"
          target="_blank"
        >
          About Zcash Foundation
        </a>
        <a
          href="https://zcashomg.org/"
          className="Footer-main-links-link"
          target="_blank"
        >
          About Zcash Open Major Grants (ZOMG)
        </a>
        <Link to="/contact" className="Footer-main-links-link">
          Contact
        </Link>
        <Link to="/tos" className="Footer-main-links-link">
          Terms of Service
        </Link>
        <Link to="/privacy" className="Footer-main-links-link">
          Privacy Policy
        </Link>
        <Link to="/code-of-conduct" className="Footer-main-links-link">
          Code of Conduct
        </Link>
      </div>
    </div>
    <div className="Footer-social">
      <a className="Footer-social-link" href="https://zfnd.org/" target="_blank">
        Zcash Foundation <Icon type="home" />
      </a>
      <a
        className="Footer-social-link"
        href="https://twitter.com/zcashomg"
        target="_blank"
        rel="noopener nofollow"
      >
        @zcashomg <Icon type="twitter" />
      </a>
      <a
        className="Footer-social-link"
        href="https://twitter.com/zcashfoundation"
        target="_blank"
        rel="noopener nofollow"
      >
        @zcashfoundation <Icon type="twitter" />
      </a>
      <a
        className="Footer-social-link"
        href="https://github.com/zcashfoundation"
        target="_blank"
        rel="noopener nofollow"
      >
        zcashfoundation <Icon type="github" />
      </a>
    </div>
  </footer>
);

export default withNamespaces()(Footer);
