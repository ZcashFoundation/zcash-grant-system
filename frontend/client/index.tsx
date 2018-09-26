import '@babel/polyfill';
import React from 'react';
import { hot } from 'react-hot-loader';
import { hydrate } from 'react-dom';
import { loadComponents } from 'loadable-components';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import { configureStore } from 'store/configure';
import Routes from './Routes';

const initialState = window && (window as any).__PRELOADED_STATE__;
const store = configureStore(initialState);

const App = hot(module)(() => (
  <Provider store={store}>
    <Router>
      <Routes />
    </Router>
  </Provider>
));

loadComponents().then(() => {
  hydrate(<App />, document.getElementById('app'));
});
