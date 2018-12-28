import { createStore, Store } from 'redux';
import { reducer, StoreState } from './reducer';

export * from './reducer';
export * from './selectors';
export * from './actions';

export const store = createStore(reducer);
