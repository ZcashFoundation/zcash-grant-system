import { Store, createStore, applyMiddleware } from 'redux';
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga';
import thunkMiddleware, { ThunkMiddleware } from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer, { AppState, combineInitialState } from './reducers';
// import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

type MiddleWare = ThunkMiddleware | SagaMiddleware<any> | any;

const bindMiddleware = (middleware: MiddleWare[]) => {
  if (process.env.NODE_ENV !== 'production') {
    const { createLogger } = require('redux-logger');
    const logger = createLogger({
      collapsed: true,
    });
    middleware = [...middleware, logger];
  }
  return composeWithDevTools(applyMiddleware(...middleware));
};

export function configureStore(
  initialState: Partial<AppState> = combineInitialState,
): Store {
  const store: Store<AppState> = createStore(
    rootReducer,
    initialState,
    bindMiddleware([sagaMiddleware, thunkMiddleware, promiseMiddleware()]),
  );

  // store.runSagaTask = () => {
  //   store.sagaTask = sagaMiddleware.run(rootSaga);
  // };

  // store.runSagaTask();

  if (process.env.NODE_ENV === 'development') {
    if (module.hot) {
      module.hot.accept('./reducers', () =>
        store.replaceReducer(require('./reducers').default),
      );
    }
  }
  return store;
}
