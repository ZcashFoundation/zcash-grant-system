import { Store, createStore, applyMiddleware } from 'redux';
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga';
import thunkMiddleware, { ThunkMiddleware } from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import rootReducer, { combineInitialState } from './reducers';
// import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

type MiddleWare = ThunkMiddleware | SagaMiddleware<any> | any;

const bindMiddleware = (middleware: MiddleWare[]) => {
  if (process.env.NODE_ENV !== 'production') {
    const { createLogger } = require('redux-logger');
    const logger = createLogger({
      collapsed: true,
    });
    const allMiddleware = [...middleware, logger];
    const { composeWithDevTools } = require('redux-devtools-extension');
    return composeWithDevTools(applyMiddleware(...allMiddleware));
  }
  return applyMiddleware(...middleware);
};

export function configureStore(initialState = combineInitialState): Store {
  const store: any = createStore(
    rootReducer,
    initialState,
    bindMiddleware([sagaMiddleware, thunkMiddleware, promiseMiddleware()]),
  );

  // store.runSagaTask = () => {
  //   store.sagaTask = sagaMiddleware.run(rootSaga);
  // };

  // store.runSagaTask();
  return store;
}
