import { SagaIterator } from 'redux-saga';
import { put, all, fork, take } from 'redux-saga/effects';
import { setWeb3, setAccounts, setContract } from './actions';
import types from './types';

/* tslint:disable no-var-requires --- TODO: find a better way to import contract */
const CrowdFundFactory = require('lib/contracts/CrowdFundFactory.json');

export function* bootstrapWeb3(): SagaIterator {
  // Don't attempt to bootstrap web3 on SSR
  if (process.env.SERVER_SIDE_RENDER) {
    return;
  }

  yield put<any>(setWeb3());
  yield take(types.WEB3_FULFILLED);

  yield all([put<any>(setAccounts()), put<any>(setContract(CrowdFundFactory))]);
}

export default function* authSaga(): SagaIterator {
  yield all([fork(bootstrapWeb3)]);
}
