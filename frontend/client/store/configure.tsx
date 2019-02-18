import { Store, createStore, applyMiddleware } from 'redux';
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga';
import thunkMiddleware, { ThunkMiddleware } from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { composeWithDevTools } from 'redux-devtools-extension';
import { routerMiddleware } from 'connected-react-router';
import rootReducer, { AppState, combineInitialState } from './reducers';
import rootSaga from './sagas';
import history from './history';

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

let storeRef = null as null | Store<AppState>;
export function getStoreRef() {
  return storeRef;
}

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

  sagaMiddleware.run(rootSaga);

  if (process.env.NODE_ENV === 'development') {
    if (module.hot) {
      module.hot.accept('./reducers', () =>
        store.replaceReducer(require('./reducers').default),
      );
    }
  }
  storeRef = store;
  return { store };
}
