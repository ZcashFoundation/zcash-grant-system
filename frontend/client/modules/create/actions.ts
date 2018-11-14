import { Dispatch } from 'redux';
import { ProposalDraft } from 'types';
import { AppState } from 'store/reducers';
import { createCrowdFund } from 'modules/web3/actions';
import types, { CreateDraftOptions } from './types';

type GetState = () => AppState;

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

export function createProposal(form: ProposalDraft) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    const state = getState();
    // TODO: Handle if contract is unavailable
    const contract = state.web3.contracts[0];
    // TODO: Move more of the backend handling into this action.
    dispatch(createCrowdFund(contract, form));
    // TODO: dispatch reset conditionally, if crowd fund is success
  };
}
