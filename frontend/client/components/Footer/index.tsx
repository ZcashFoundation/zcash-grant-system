import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'antd';
import ZFGrantsLogo from 'static/images/logo-name-light.svg';
import GrantIoLogo from 'static/images/grantio-logo-name.svg';
import './style.less';

export default () => (
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
      <p className="Footer-main-about">
        ZF Grants is an open-source, community driven platform that helps
        creators get funding to build a better Zcash. ZF Grants is owned
        and operated by the Zcash Foundation.
      </p>
      <div className="Footer-main-links">
        <a href="https://www.zfnd.org/about/" className="Footer-main-links-link" target="_blank">
          About
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
      <a className="Footer-social-link" href="https://twitter.com/zcashfoundation" target="_blank" rel="noopener nofollow">
        @zcashfoundation <Icon type="twitter" />
      </a>
      <a className="Footer-social-link" href="https://github.com/zcashfoundation" target="_blank" rel="noopener nofollow">
        zcashfoundation <Icon type="github" />
      </a>
    </div>
  </footer>
);
