import '@babel/polyfill';
import React from 'react';
import { hot } from 'react-hot-loader';
import { hydrate } from 'react-dom';
import { loadComponents } from 'loadable-components';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { I18nextProvider } from 'react-i18next';
import { configureStore } from 'store/configure';
import Routes from './Routes';
import i18n from './i18n';

const initialState = window && (window as any).__PRELOADED_STATE__;
const { store, persistor } = configureStore(initialState);
const i18nLanguage = window && (window as any).__PRELOADED_I18N__;
i18n.changeLanguage(i18nLanguage.locale);
i18n.addResourceBundle(i18nLanguage.locale, 'common', i18nLanguage.resources, true);

const App = hot(module)(() => (
  <I18nextProvider i18n={i18n}>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <Router>
          <Routes />
        </Router>
      </PersistGate>
    </Provider>
  </I18nextProvider>
));

loadComponents().then(() => {
  hydrate(<App />, document.getElementById('app'));
});
