import '@babel/polyfill';
import React from 'react';
import { hot } from 'react-hot-loader';
import { hydrate } from 'react-dom';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import * as Sentry from '@sentry/browser';
import { I18nextProvider } from 'react-i18next';
import { loadableReady } from '@loadable/component';
import { configureStore } from 'store/configure';
import history from 'store/history';
import { massageSerializedState } from 'utils/api';
import Routes from './Routes';
import i18n from './i18n';
import ErrorWrap from 'components/ErrorWrap';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: process.env.SENTRY_RELEASE,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
});
const initialState =
  window && massageSerializedState((window as any).__PRELOADED_STATE__);
const { store } = configureStore(initialState);
const i18nLanguage = window && (window as any).__PRELOADED_I18N__;
i18n.changeLanguage(i18nLanguage.locale);
i18n.addResourceBundle(i18nLanguage.locale, 'common', i18nLanguage.resources, true);

const App = hot(module)(() => (
  <ErrorWrap isFullscreen>
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <Router history={history}>
          <Routes />
        </Router>
      </Provider>
    </I18nextProvider>
  </ErrorWrap>
));

loadableReady(() => {
  hydrate(<App />, document.getElementById('app'));
});
