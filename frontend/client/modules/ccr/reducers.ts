import types from './types';
import { CCRDraft, CCR } from 'types';

export interface CCRState {
  drafts: CCRDraft[] | null;
  form: CCRDraft | null;

  isInitializingForm: boolean;
  initializeFormError: string | null;

  isSavingDraft: boolean;
  hasSavedDraft: boolean;
  saveDraftError: string | null;

  isFetchingDrafts: boolean;
  fetchDraftsError: string | null;

  isCreatingDraft: boolean;
  createDraftError: string | null;

  isDeletingDraft: boolean;
  deleteDraftError: string | null;

  submittedCCR: CCR | null;
  isSubmitting: boolean;
  submitError: string | null;

  publishedCCR: CCR | null;
  isPublishing: boolean;
  publishError: string | null;
}

export const INITIAL_STATE: CCRState = {
  drafts: null,
  form: null,

  isInitializingForm: false,
  initializeFormError: null,

  isSavingDraft: false,
  hasSavedDraft: true,
  saveDraftError: null,

  isFetchingDrafts: false,
  fetchDraftsError: null,

  isCreatingDraft: false,
  createDraftError: null,

  isDeletingDraft: false,
  deleteDraftError: null,

  submittedCCR: null,
  isSubmitting: false,
  submitError: null,

  publishedCCR: null,
  isPublishing: false,
  publishError: null,
};

export default function createReducer(
  state: CCRState = INITIAL_STATE,
  action: any,
): CCRState {
  switch (action.type) {
    case types.UPDATE_CCR_FORM:
      return {
        ...state,
        form: {
          ...state.form,
          ...action.payload,
        },
        hasSavedDraft: false,
      };

    case types.INITIALIZE_CCR_FORM_PENDING:
      return {
        ...state,
        form: null,
        isInitializingForm: true,
        initializeFormError: null,
      };
    case types.INITIALIZE_CCR_FORM_FULFILLED:
      return {
        ...state,
        form: { ...action.payload },
        isInitializingForm: false,
      };
    case types.INITIALIZE_CCR_FORM_REJECTED:
      return {
        ...state,
        isInitializingForm: false,
        initializeFormError: action.payload,
      };

    case types.SAVE_CCR_DRAFT_PENDING:
      return {
        ...state,
        isSavingDraft: true,
      };
    case types.SAVE_CCR_DRAFT_FULFILLED:
      return {
        ...state,
        isSavingDraft: false,
        hasSavedDraft: true,
        // Only clear error once save was a success
        saveDraftError: null,
      };
    case types.SAVE_CCR_DRAFT_REJECTED:
      return {
        ...state,
        isSavingDraft: false,
        hasSavedDraft: false,
        saveDraftError: action.payload,
      };

    case types.FETCH_CCR_DRAFTS_PENDING:
      return {
        ...state,
        isFetchingDrafts: true,
        fetchDraftsError: null,
      };
    case types.FETCH_CCR_DRAFTS_FULFILLED:
      return {
        ...state,
        isFetchingDrafts: false,
        drafts: action.payload,
      };
    case types.FETCH_CCR_DRAFTS_REJECTED:
      return {
        ...state,
        isFetchingDrafts: false,
        fetchDraftsError: action.payload,
      };

    case types.CREATE_CCR_DRAFT_PENDING:
      return {
        ...state,
        isCreatingDraft: true,
        createDraftError: null,
      };
    case types.CREATE_CCR_DRAFT_FULFILLED:
      return {
        ...state,
        drafts: [...(state.drafts || []), action.payload],
        isCreatingDraft: false,
      };
    case types.CREATE_CCR_DRAFT_REJECTED:
      return {
        ...state,
        createDraftError: action.payload,
        isCreatingDraft: false,
      };

    case types.DELETE_CCR_DRAFT_PENDING:
      return {
        ...state,
        isDeletingDraft: true,
        deleteDraftError: null,
      };
    case types.DELETE_CCR_DRAFT_FULFILLED:
      return {
        ...state,
        isDeletingDraft: false,
      };
    case types.DELETE_CCR_DRAFT_REJECTED:
      return {
        ...state,
        isDeletingDraft: false,
        deleteDraftError: action.payload,
      };

    case types.SUBMIT_CCR_PENDING:
      return {
        ...state,
        submittedCCR: null,
        isSubmitting: true,
        submitError: null,
      };
    case types.SUBMIT_CCR_FULFILLED:
      return {
        ...state,
        submittedCCR: action.payload,
        isSubmitting: false,
      };
    case types.SUBMIT_CCR_REJECTED:
      return {
        ...state,
        submitError: action.payload,
        isSubmitting: false,
      };
  }
  return state;
}
