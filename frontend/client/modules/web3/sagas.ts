import { SagaIterator } from 'redux-saga';
import { all, call, fork, put, select, take, takeLatest } from 'redux-saga/effects';
import { checkNetwork, setAccounts, setWeb3 } from './actions';
import { safeEnable } from 'utils/web3';
import types from './types';
import { selectIsMissingWeb3 } from 'modules/web3/selectors';

export function* bootstrapWeb3(): SagaIterator {
  // Don't attempt to bootstrap web3 on SSR
  if (process.env.SERVER_SIDE_RENDER) {
    return;
  }
  yield put<any>(setWeb3());
  yield take(types.WEB3_FULFILLED);

  yield all([put<any>(setAccounts()), put<any>(checkNetwork())]);
}

export function* handleEnableWeb3(): SagaIterator {
  const isMissingWeb3 = yield select(selectIsMissingWeb3);

  try {
    if (isMissingWeb3) {
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
