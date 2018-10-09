import { fork } from 'redux-saga/effects';
import { authSagas } from 'modules/auth';
import { web3Sagas } from 'modules/web3';

export default function* rootSaga() {
  yield fork(authSagas);
  yield fork(web3Sagas);
}
