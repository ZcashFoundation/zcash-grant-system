import { fork } from 'redux-saga/effects';
import { authSagas } from 'modules/auth';
import { createSagas } from 'modules/create';
import { ccrSagas } from 'modules/ccr';

export default function* rootSaga() {
  yield fork(authSagas);
  yield fork(createSagas);
  yield fork(ccrSagas);
}
