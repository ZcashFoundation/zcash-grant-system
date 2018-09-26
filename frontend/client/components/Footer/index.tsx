import React from 'react';
import { Link } from 'react-router-dom';
import './style.less';

export default () => (
  <footer className="Footer">
    <Link className="Footer-title" to="/">
      Grant.io
    </Link>
    {/*
      <div className="Footer-links">
        <a className="Footer-links-link">about</a>
        <a className="Footer-links-link">legal</a>
        <a className="Footer-links-link">privacy policy</a>
      </div>
    */}
  </footer>
);
