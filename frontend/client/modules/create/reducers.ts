import types from './types';
import { CreateFormState, ProposalDraft } from 'types';
import { ONE_DAY } from 'utils/time';

export interface CreateState {
  drafts: ProposalDraft[] | null;
  form: CreateFormState;

  isSavingDraft: boolean;
  hasSavedDraft: boolean;
  saveDraftError: string | null;

  isFetchingDrafts: boolean;
  fetchDraftsError: string | null;
}

export const INITIAL_STATE: CreateState = {
  drafts: null,

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

  isFetchingDrafts: false,
  fetchDraftsError: null,
};

export default function createReducer(
  state: CreateState = INITIAL_STATE,
  action: any,
): CreateState {
  switch (action.type) {
    case types.CREATE_DRAFT_PENDING:

    case types.UPDATE_FORM:
      return {
        ...state,
        form: {
          ...state.form,
          ...action.payload,
        },
        hasSavedDraft: false,
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

    case types.FETCH_DRAFTS_PENDING:
      return {
        ...state,
        isFetchingDrafts: true,
        fetchDraftsError: null,
      };
    case types.FETCH_DRAFTS_FULFILLED:
      return {
        ...state,
        isFetchingDrafts: false,
        drafts: action.payload.data,
      };
    case types.FETCH_DRAFTS_REJECTED:
      return {
        ...state,
        isFetchingDrafts: false,
        fetchDraftsError: action.payload,
      };
  }
  return state;
}
