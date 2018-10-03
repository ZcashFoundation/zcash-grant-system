import { SagaIterator } from 'redux-saga';
import { select, put, all, takeEvery } from 'redux-saga/effects';
import { REHYDRATE } from 'redux-persist';
import { getAuthTokenAddress } from './selectors';
import { authUser } from './actions';

export function* authFromToken(): SagaIterator {
  const address: ReturnType<typeof getAuthTokenAddress> = yield select(
    getAuthTokenAddress,
  );
  if (!address) {
    return;
  }

  // TODO: Figure out how to type redux-saga with thunks
  yield put<any>(authUser(address));
}

export default function* authSaga(): SagaIterator {
  yield all([
    // Run authFromToken as soon as persisted state is hydrated
    // TODO: Do this server-side at some point
    takeEvery(REHYDRATE, authFromToken),
  ]);
}
