import React from 'react';
import { Link } from 'react-router-dom';
import Logo from 'static/images/logo-name.svg';
import './style.less';

export default () => (
  <footer className="Footer">
    <Link className="Footer-title" to="/">
      <Logo className="Footer-title-logo" />
    </Link>
    <div className="Footer-links">
      <Link to="/about" className="Footer-links-link">
        about
      </Link>
      <Link to="/contact" className="Footer-links-link">
        contact
      </Link>
      <Link to="/tos" className="Footer-links-link">
        terms of service
      </Link>
      <Link to="/privacy" className="Footer-links-link">
        privacy policy
      </Link>
    </div>
  </footer>
);
