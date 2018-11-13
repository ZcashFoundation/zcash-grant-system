import { Dispatch } from 'redux';
import { CreateFormState } from 'types';
import { getProposalDrafts } from 'api/api';
import { sleep } from 'utils/helpers';
import { AppState } from 'store/reducers';
import { createCrowdFund } from 'modules/web3/actions';
import { formToBackendData, formToContractData } from './utils';
import types, { CreateDraftOptions } from './types';

type GetState = () => AppState;

// TODO: Replace with server side storage
const LS_DRAFT_KEY = 'CREATE_PROPOSAL_DRAFT';

export function updateForm(form: Partial<CreateFormState>) {
  return (dispatch: Dispatch<any>) => {
    dispatch({
      type: types.UPDATE_FORM,
      payload: form,
    });
    dispatch(saveDraft());
  };
}

export function saveDraft() {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    const { form } = getState().create;
    dispatch({ type: types.SAVE_DRAFT_PENDING });
    await sleep(1000);

    // TODO: Replace with server side save
    localStorage.setItem(LS_DRAFT_KEY, JSON.stringify(form));
    dispatch({ type: types.SAVE_DRAFT_FULFILLED });
  };
}

export function fetchDrafts() {
  return (dispatch: Dispatch<any>) => {
    return dispatch({
      type: types.FETCH_DRAFTS,
      payload: getProposalDrafts(),
    });
  };
}

export function createDraft(opts: CreateDraftOptions = {}) {
  return {
    type: types.CREATE_DRAFT_PENDING,
    payload: opts,
  };
}

export function createProposal(form: CreateFormState) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    const state = getState();
    // TODO: Handle if contract is unavailable
    const contract = state.web3.contracts[0];
    // TODO: Move more of the backend handling into this action.
    dispatch(
      createCrowdFund(contract, formToContractData(form), formToBackendData(form)),
    );
    // TODO: dispatch reset conditionally, if crowd fund is success
  };
}
