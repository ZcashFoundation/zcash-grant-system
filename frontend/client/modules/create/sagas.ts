import { SagaIterator } from 'redux-saga';
import { takeEvery, put, call } from 'redux-saga/effects';
import { push } from 'connected-react-router';
import { postProposalDraft } from 'api/api';
import { createDraft } from './actions';
import types from './types';

export function* handleCreateDraft(action: ReturnType<typeof createDraft>): SagaIterator {
  try {
    const res: Yielded<typeof postProposalDraft> = yield call(postProposalDraft);
    yield put({
      type: types.CREATE_DRAFT_FULFILLED,
      payload: res.data,
    });

    if (action.payload.redirect) {
      yield put(push(`/proposals/${res.data.proposalId}/edit`));
    }
  } catch(err) {
    yield put({
      type: types.CREATE_DRAFT_REJECTED,
      payload: err.message || err.toString(),
      error: true,
    });
  }
}

export default function* createSagas(): SagaIterator {
  yield takeEvery(types.CREATE_DRAFT_PENDING, handleCreateDraft);
}