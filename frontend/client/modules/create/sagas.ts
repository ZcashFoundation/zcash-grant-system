import { SagaIterator } from 'redux-saga';
import { takeEvery, takeLatest, put, take, call, select } from 'redux-saga/effects';
import { push } from 'connected-react-router';
import {
  postProposalDraft,
  getProposalDrafts,
  putProposal,
  deleteProposalDraft,
} from 'api/api';
import { getDrafts, getDraftById, getFormState } from './selectors';
import {
  createDraft,
  fetchDrafts,
  fetchAndCreateDrafts,
  initializeForm,
  deleteDraft,
} from './actions';
import types from './types';

export function* handleCreateDraft(action: ReturnType<typeof createDraft>): SagaIterator {
  try {
    const res: Yielded<typeof postProposalDraft> = yield call(
      postProposalDraft,
      action.payload.rfpId,
    );
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

export function* handleSaveDraft(): SagaIterator {
  try {
    const draft: Yielded<typeof getFormState> = yield select(getFormState);
    if (!draft) {
      throw new Error('No form state to save draft');
    }
    yield call(putProposal, draft);
    yield put({ type: types.SAVE_DRAFT_FULFILLED });
  } catch (err) {
    yield put({
      type: types.SAVE_DRAFT_REJECTED,
      payload: err.message || err.toString(),
      error: true,
    });
  }
}

export function* handleFetchAndCreateDrafts(
  action: ReturnType<typeof fetchAndCreateDrafts>,
): SagaIterator {
  yield put(fetchDrafts());
  yield take([types.FETCH_DRAFTS_FULFILLED, types.FETCH_DRAFTS_PENDING]);
  const drafts: Yielded<typeof getDrafts> = yield select(getDrafts);

  // Back out if draft fetch failed and we don't have drafts
  if (!drafts) {
    console.warn('Fetch of drafts failed, not creating new draft');
    return;
  }

  // Create new draft if we don't have one for rfp (if provided) or if
  // we don't have any at all
  if (action.payload.rfpId) {
    const rfpDraft = drafts.find(d => !!d.rfp && d.rfp.id === action.payload.rfpId);
    if (!rfpDraft) {
      yield put(createDraft(action.payload));
    } else if (action.payload.redirect) {
      // If we were supposed to redirect, redirect to existing rfp draft
      yield put(push(`/proposals/${rfpDraft.proposalId}/edit`));
    }
  } else if (drafts.length === 0) {
    yield put(createDraft(action.payload));
  }
}

export function* handleDeleteDraft(action: ReturnType<typeof deleteDraft>): SagaIterator {
  try {
    yield call(deleteProposalDraft, action.payload);
    put({ type: types.DELETE_DRAFT_FULFILLED });
  } catch (err) {
    yield put({
      type: types.DELETE_DRAFT_REJECTED,
      payload: err.message || err.toString(),
      error: true,
    });
    return;
  }
  yield call(handleFetchDrafts);
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
  yield takeLatest(types.SAVE_DRAFT_PENDING, handleSaveDraft);
  yield takeEvery(types.DELETE_DRAFT_PENDING, handleDeleteDraft);
  yield takeEvery(types.INITIALIZE_FORM_PENDING, handleInitializeForm);
  yield takeEvery(types.FETCH_AND_CREATE_DRAFTS, handleFetchAndCreateDrafts);
}
