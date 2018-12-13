import { SagaIterator } from 'redux-saga';
import { put } from 'redux-saga/effects';
import { checkUser } from './actions';

// TODO: poll checkUser?

export default function* authSaga(): SagaIterator {
  yield put<any>(checkUser());
}
