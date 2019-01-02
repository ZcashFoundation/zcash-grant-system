import { SagaIterator } from 'redux-saga';
import { put } from 'redux-saga/effects';
import { checkUser } from './actions';

export default function* authSaga(): SagaIterator {
  if (typeof window === 'undefined') return;
  yield put<any>(checkUser());
}
