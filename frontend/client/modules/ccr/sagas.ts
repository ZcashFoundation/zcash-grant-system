import { SagaIterator } from 'redux-saga';
import { takeEvery, takeLatest, put, take, call, select } from 'redux-saga/effects';
import { replace } from 'connected-react-router';
import {
  postCCRDraft,
  getCCRDrafts,
  putCCR,
  deleteCCR as RDeleteCCRDraft,
  getCCR,
} from 'api/api';
import { getDrafts, getDraftById, getFormState } from './selectors';
import {
  createCCRDraft,
  fetchCCRDrafts,
  initializeForm,
  deleteCCRDraft,
} from './actions';
import types from './types';

export function* handleCreateDraft(): SagaIterator {
  try {
    const res: Yielded<typeof postCCRDraft> = yield call(postCCRDraft);
    yield put({
      type: types.CREATE_CCR_DRAFT_FULFILLED,
      payload: res.data,
    });
    yield put(replace(`/ccrs/${res.data.ccrId}/edit`));
  } catch (err) {
    yield put({
      type: types.CREATE_CCR_DRAFT_REJECTED,
      payload: err.message || err.toString(),
      error: true,
    });
  }
}

export function* handleFetchDrafts(): SagaIterator {
  try {
    const res: Yielded<typeof getCCRDrafts> = yield call(getCCRDrafts);
    yield put({
      type: types.FETCH_CCR_DRAFTS_FULFILLED,
      payload: res.data,
    });
  } catch (err) {
    yield put({
      type: types.FETCH_CCR_DRAFTS_REJECTED,
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
    yield call(putCCR, draft);
    yield put({ type: types.SAVE_CCR_DRAFT_FULFILLED });
  } catch (err) {
    yield put({
      type: types.SAVE_CCR_DRAFT_REJECTED,
      payload: err.message || err.toString(),
      error: true,
    });
  }
}

export function* handleFetchAndCreateDrafts(): SagaIterator {
  yield put(fetchCCRDrafts());
  yield take([types.FETCH_CCR_DRAFTS_FULFILLED, types.FETCH_CCR_DRAFTS_PENDING]);
  const drafts: Yielded<typeof getDrafts> = yield select(getDrafts);

  // Back out if draft fetch failed and we don't have drafts
  if (!drafts) {
    console.warn('Fetch of drafts failed, not creating new draft');
    return;
  }

  if (drafts.length === 0) {
    yield put(createCCRDraft());
  }
}

export function* handleDeleteDraft(
  action: ReturnType<typeof deleteCCRDraft>,
): SagaIterator {
  try {
    yield call(RDeleteCCRDraft, action.payload);
    put({ type: types.DELETE_CCR_DRAFT_FULFILLED });
  } catch (err) {
    yield put({
      type: types.DELETE_CCR_DRAFT_REJECTED,
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
    const ccrId = action.payload;
    let draft: Yielded<typeof getDraftById> = yield select(getDraftById, ccrId);
    if (!draft) {
      yield call(handleFetchDrafts);
      draft = yield select(getDraftById, ccrId);
      if (!draft) {
        // If it's a real ccr, just not in draft form, redirect to it
        try {
          yield call(getCCR, ccrId);
          yield put({ type: types.INITIALIZE_CCR_FORM_REJECTED });
          yield put(replace(`/ccrs/${action.payload}`));
          return;
        } catch (err) {
          throw new Error('CCR not found');
        }
      }
    }
    yield put({
      type: types.INITIALIZE_CCR_FORM_FULFILLED,
      payload: draft,
    });
  } catch (err) {
    yield put({
      type: types.INITIALIZE_CCR_FORM_REJECTED,
      payload: err.message || err.toString(),
      error: true,
    });
  }
}

export default function* ccrSagas(): SagaIterator {
  yield takeEvery(types.CREATE_CCR_DRAFT_PENDING, handleCreateDraft);
  yield takeLatest(types.FETCH_CCR_DRAFTS_PENDING, handleFetchDrafts);
  yield takeLatest(types.SAVE_CCR_DRAFT_PENDING, handleSaveDraft);
  yield takeEvery(types.DELETE_CCR_DRAFT_PENDING, handleDeleteDraft);
  yield takeEvery(types.INITIALIZE_CCR_FORM_PENDING, handleInitializeForm);
  yield takeEvery(types.FETCH_AND_CREATE_CCR_DRAFTS, handleFetchAndCreateDrafts);
}
