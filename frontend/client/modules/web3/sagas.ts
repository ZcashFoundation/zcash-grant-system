import { SagaIterator } from 'redux-saga';
import { put, all, fork, take, takeLatest, select, call } from 'redux-saga/effects';
import { setWeb3, setAccounts, setContract } from './actions';
import { selectWeb3 } from './selectors';
import { safeEnable } from 'utils/web3';
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

export function* handleEnableWeb3(): SagaIterator {
  const web3 = yield select(selectWeb3);

  try {
    if (!web3) {
      const web3Action = yield take([types.WEB3_FULFILLED, types.WEB3_REJECTED]);
      if (web3Action.type === types.WEB3_REJECTED) {
        throw new Error('No web3 instance available');
      }
    }

    yield call(safeEnable);
    yield put<any>(setAccounts());
    yield put({ type: types.ENABLE_WEB3_FULFILLED });
  } catch (err) {
    yield put({
      type: types.ENABLE_WEB3_REJECTED,
      payload: err.message || err.toString(),
      error: true,
    });
  }
}

export default function* authSaga(): SagaIterator {
  yield all([fork(bootstrapWeb3)]);
  yield takeLatest(types.ENABLE_WEB3_PENDING, handleEnableWeb3);
}
