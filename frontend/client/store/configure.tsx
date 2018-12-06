import { Store, createStore, applyMiddleware } from 'redux';
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga';
import thunkMiddleware, { ThunkMiddleware } from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { composeWithDevTools } from 'redux-devtools-extension';
import { persistStore, Persistor } from 'redux-persist';
import { routerMiddleware } from 'connected-react-router';
import rootReducer, { AppState, combineInitialState } from './reducers';
import rootSaga from './sagas';
import history from './history';
import axios from 'api/axios';

const sagaMiddleware = createSagaMiddleware();

type MiddleWare = ThunkMiddleware | SagaMiddleware<any> | any;

const bindMiddleware = (middleware: MiddleWare[]) => {
  if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
    const { createLogger } = require('redux-logger');
    const logger = createLogger({
      collapsed: true,
    });
    middleware = [...middleware, logger];
  }
  return composeWithDevTools(applyMiddleware(...middleware));
};

export function configureStore(initialState: Partial<AppState> = combineInitialState) {
  const store: Store<AppState> = createStore(
    rootReducer,
    initialState,
    bindMiddleware([
      sagaMiddleware,
      thunkMiddleware,
      promiseMiddleware(),
      routerMiddleware(history),
    ]),
  );
  // Don't persist server side, but don't mess up types for client side
  const persistor: Persistor = process.env.SERVER_SIDE_RENDER
    ? (undefined as any)
    : persistStore(store);

  sagaMiddleware.run(rootSaga);

  if (process.env.NODE_ENV === 'development') {
    if (module.hot) {
      module.hot.accept('./reducers', () =>
        store.replaceReducer(require('./reducers').default),
      );
    }
  }

  // Any global listeners to the store go here
  let prevState = store.getState();
  store.subscribe(() => {
    const state = store.getState();

    // Setup the API with auth credentials whenever they change
    const { authSignature } = state.auth;
    if (authSignature !== prevState.auth.authSignature) {
      axios.defaults.headers.common.MsgSignature = authSignature
        ? authSignature.signedMessage
        : undefined;
      axios.defaults.headers.common.RawTypedData = authSignature
        ? JSON.stringify(authSignature.rawTypedData)
        : undefined;
    }

    prevState = state;
  });

  return { store, persistor };
}
