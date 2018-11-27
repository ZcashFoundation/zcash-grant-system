import { fork } from 'redux-saga/effects';
import { authSagas } from 'modules/auth';
import { web3Sagas } from 'modules/web3';
import { createSagas } from 'modules/create';

export default function* rootSaga() {
  yield fork(authSagas);
  yield fork(web3Sagas);
  yield fork(createSagas);
}
