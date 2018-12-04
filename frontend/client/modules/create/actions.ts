import { Dispatch } from 'redux';
import { ProposalDraft } from 'types';
import { createCrowdFund } from 'modules/web3/actions';
import types, { CreateDraftOptions } from './types';

export function initializeForm(proposalId: number) {
  return {
    type: types.INITIALIZE_FORM_PENDING,
    payload: proposalId,
  };
}

export function updateForm(form: Partial<ProposalDraft>) {
  return (dispatch: Dispatch<any>) => {
    dispatch({
      type: types.UPDATE_FORM,
      payload: form,
    });
    dispatch(saveDraft());
  };
}

export function saveDraft() {
  return { type: types.SAVE_DRAFT_PENDING };
}

export function fetchDrafts() {
  return { type: types.FETCH_DRAFTS_PENDING };
}

export function createDraft(opts: CreateDraftOptions = {}) {
  return {
    type: types.CREATE_DRAFT_PENDING,
    payload: opts,
  };
}

export function deleteDraft(proposalId: number) {
  return {
    type: types.DELETE_DRAFT_PENDING,
    payload: proposalId,
  };
}

export function createProposal(form: ProposalDraft) {
  return async (dispatch: Dispatch<any>) => {
    // TODO: Move more of the backend handling into this action.
    dispatch(createCrowdFund(form));
    // TODO: dispatch reset conditionally, if crowd fund is success
  };
}
