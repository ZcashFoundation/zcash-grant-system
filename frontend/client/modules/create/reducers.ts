import types, { CreateFormState } from './types';
import { ONE_DAY } from 'utils/time';

export interface CreateState {
  form: CreateFormState;

  isSavingDraft: boolean;
  hasSavedDraft: boolean;
  saveDraftError: string | null;

  isFetchingDraft: boolean;
  hasFetchedDraft: boolean;
  fetchDraftError: string | null;
}

export const INITIAL_STATE: CreateState = {
  form: {
    title: '',
    brief: '',
    details: '',
    category: null,
    amountToRaise: '',
    payOutAddress: '',
    trustees: [],
    milestones: [],
    team: [],
    deadline: ONE_DAY * 60,
    milestoneDeadline: ONE_DAY * 7,
  },

  isSavingDraft: false,
  hasSavedDraft: true,
  saveDraftError: null,

  isFetchingDraft: false,
  hasFetchedDraft: false,
  fetchDraftError: null,
};

export default function createReducer(state: CreateState = INITIAL_STATE, action: any) {
  switch (action.type) {
    case types.UPDATE_FORM:
      return {
        ...state,
        form: {
          ...state.form,
          ...action.payload,
        },
        hasSavedDraft: false,
      };

    case types.RESET_FORM:
      return {
        ...state,
        form: { ...INITIAL_STATE.form },
        hasSavedDraft: true,
        hasFetchedDraft: false,
      };

    case types.SAVE_DRAFT_PENDING:
      return {
        ...state,
        isSavingDraft: true,
      };
    case types.SAVE_DRAFT_FULFILLED:
      return {
        ...state,
        isSavingDraft: false,
        hasSavedDraft: true,
        // Only clear error once save was a success
        saveDraftError: null,
      };
    case types.SAVE_DRAFT_REJECTED:
      return {
        ...state,
        isSavingDraft: false,
        hasSavedDraft: false,
        saveDraftError: action.payload,
      };

    case types.FETCH_DRAFT_PENDING:
      return {
        ...state,
        isFetchingDraft: true,
        fetchDraftError: null,
      };
    case types.FETCH_DRAFT_FULFILLED:
      return {
        ...state,
        isFetchingDraft: false,
        hasFetchedDraft: !!action.payload,
        form: action.payload
          ? {
              ...state.form,
              ...action.payload,
            }
          : state.form,
      };
    case types.FETCH_DRAFT_REJECTED:
      return {
        ...state,
        isFetchingDraft: false,
        fetchDraftError: action.payload,
      };
  }
  return state;
}
