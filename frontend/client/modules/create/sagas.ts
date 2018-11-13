import { SagaIterator } from 'redux-saga';
import { takeEvery, takeLatest, put, call, select } from 'redux-saga/effects';
import { push } from 'connected-react-router';
import { postProposalDraft, getProposalDrafts } from 'api/api';
import { getDraftById } from './selectors';
import { createDraft, fetchDrafts, initializeForm } from './actions';
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
  } catch (err) {
    yield put({
      type: types.CREATE_DRAFT_REJECTED,
      payload: err.message || err.toString(),
      error: true,
    });
  }
}

export function* handleFetchDrafts(): SagaIterator {
  try {
    const res: Yielded<typeof getProposalDrafts> = yield call(getProposalDrafts);
    yield put({
      type: types.FETCH_DRAFTS_FULFILLED,
      payload: res.data,
    });
  } catch (err) {
    yield put({
      type: types.FETCH_DRAFTS_REJECTED,
      payload: err.message || err.toString(),
      error: true,
    });
  }
}

export function* handleInitializeForm(
  action: ReturnType<typeof initializeForm>,
): SagaIterator {
  try {
    let draft: Yielded<typeof getDraftById> = yield select(getDraftById, action.payload);
    if (!draft) {
      yield call(handleFetchDrafts);
      draft = yield select(getDraftById, action.payload);
      if (!draft) {
        throw new Error('Proposal not found');
      }
    }
    yield put({
      type: types.INITIALIZE_FORM_FULFILLED,
      payload: draft,
    });
  } catch (err) {
    yield put({
      type: types.INITIALIZE_FORM_REJECTED,
      payload: err.message || err.toString(),
      error: true,
    });
  }
}

export default function* createSagas(): SagaIterator {
  yield takeEvery(types.CREATE_DRAFT_PENDING, handleCreateDraft);
  yield takeLatest(types.FETCH_DRAFTS_PENDING, handleFetchDrafts);
  yield takeEvery(types.INITIALIZE_FORM_PENDING, handleInitializeForm);
}
