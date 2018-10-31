import '@babel/polyfill';
import React from 'react';
import { hot } from 'react-hot-loader';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from './Routes';

const App = hot(module)(() => (
  <Router>
    <Routes />
  </Router>
));

render(<App />, document.getElementById('root'));
