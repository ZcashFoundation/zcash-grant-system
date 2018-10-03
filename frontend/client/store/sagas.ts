import { fork } from 'redux-saga/effects';
import { authSagas } from 'modules/auth';

export default function* rootSaga() {
  yield fork(authSagas);
}
