import { Dispatch } from 'redux';
import { ProposalDraft } from 'types';
import types, { CreateDraftOptions } from './types';
import {
  putProposal,
  putProposalSubmitForApproval,
  deleteProposalRFPLink,
} from 'api/api';

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

export function fetchAndCreateDrafts(opts: CreateDraftOptions = {}) {
  return {
    type: types.FETCH_AND_CREATE_DRAFTS,
    payload: opts,
  };
}

export function deleteDraft(proposalId: number) {
  return {
    type: types.DELETE_DRAFT_PENDING,
    payload: proposalId,
  };
}

export function submitProposal(form: ProposalDraft) {
  return async (dispatch: Dispatch<any>) => {
    dispatch({ type: types.SUBMIT_PROPOSAL_PENDING });
    try {
      await putProposal(form);
      const res = await putProposalSubmitForApproval(form);
      dispatch({
        type: types.SUBMIT_PROPOSAL_FULFILLED,
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: types.SUBMIT_PROPOSAL_REJECTED,
        payload: err.message || err.toString(),
        error: true,
      });
    }
  };
}

export function unlinkProposalRFP(proposalId: number) {
  return async (dispatch: Dispatch<any>) => {
    dispatch({ type: types.UNLINK_PROPOSAL_RFP_PENDING });
    try {
      await deleteProposalRFPLink(proposalId);
      dispatch({ type: types.UNLINK_PROPOSAL_RFP_FULFILLED });
      dispatch(fetchDrafts());
    } catch (err) {
      dispatch({
        type: types.UNLINK_PROPOSAL_RFP_REJECTED,
        payload: err.message || err.toString(),
        error: true,
      });
    }
  };
}
