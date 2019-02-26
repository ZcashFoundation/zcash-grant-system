import types from './types';
import { ProposalDraft, Proposal } from 'types';

export interface CreateState {
  drafts: ProposalDraft[] | null;
  form: ProposalDraft | null;

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

  submittedProposal: Proposal | null;
  isSubmitting: boolean;
  submitError: string | null;

  publishedProposal: Proposal | null;
  isPublishing: boolean;
  publishError: string | null;

  isUnlinkingProposalRFP: boolean;
  unlinkProposalRFPError: string | null;
}

export const INITIAL_STATE: CreateState = {
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

  submittedProposal: null,
  isSubmitting: false,
  submitError: null,

  publishedProposal: null,
  isPublishing: false,
  publishError: null,

  isUnlinkingProposalRFP: false,
  unlinkProposalRFPError: null,
};

export default function createReducer(
  state: CreateState = INITIAL_STATE,
  action: any,
): CreateState {
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

    case types.INITIALIZE_FORM_PENDING:
      return {
        ...state,
        form: null,
        isInitializingForm: true,
        initializeFormError: null,
      };
    case types.INITIALIZE_FORM_FULFILLED:
      return {
        ...state,
        form: { ...action.payload },
        isInitializingForm: false,
      };
    case types.INITIALIZE_FORM_REJECTED:
      return {
        ...state,
        isInitializingForm: false,
        initializeFormError: action.payload,
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
        drafts: action.payload,
      };
    case types.FETCH_DRAFTS_REJECTED:
      return {
        ...state,
        isFetchingDrafts: false,
        fetchDraftsError: action.payload,
      };

    case types.CREATE_DRAFT_PENDING:
      return {
        ...state,
        isCreatingDraft: true,
        createDraftError: null,
      };
    case types.CREATE_DRAFT_FULFILLED:
      return {
        ...state,
        drafts: [...(state.drafts || []), action.payload],
        isCreatingDraft: false,
      };
    case types.CREATE_DRAFT_REJECTED:
      return {
        ...state,
        createDraftError: action.payload,
        isCreatingDraft: false,
      };

    case types.DELETE_DRAFT_PENDING:
      return {
        ...state,
        isDeletingDraft: true,
        deleteDraftError: null,
      };
    case types.DELETE_DRAFT_FULFILLED:
      return {
        ...state,
        isDeletingDraft: false,
      };
    case types.DELETE_DRAFT_REJECTED:
      return {
        ...state,
        isDeletingDraft: false,
        deleteDraftError: action.payload,
      };

    case types.SUBMIT_PROPOSAL_PENDING:
      return {
        ...state,
        submittedProposal: null,
        isSubmitting: true,
        submitError: null,
      };
    case types.SUBMIT_PROPOSAL_FULFILLED:
      return {
        ...state,
        submittedProposal: action.payload,
        isSubmitting: false,
      };
    case types.SUBMIT_PROPOSAL_REJECTED:
      return {
        ...state,
        submitError: action.payload,
        isSubmitting: false,
      };

    case types.UNLINK_PROPOSAL_RFP_PENDING:
      return {
        ...state,
        isUnlinkingProposalRFP: true,
        unlinkProposalRFPError: null,
      };
    case types.UNLINK_PROPOSAL_RFP_FULFILLED:
      return {
        ...state,
        isUnlinkingProposalRFP: false,
      };
    case types.UNLINK_PROPOSAL_RFP_REJECTED:
      return {
        ...state,
        isUnlinkingProposalRFP: false,
        unlinkProposalRFPError: action.payload,
      };
  }
  return state;
}
