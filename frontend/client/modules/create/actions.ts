import { Dispatch } from 'redux';
import types, { CreateFormState } from './types';
import { sleep } from 'utils/helpers';
import { AppState } from 'store/reducers';
import { createCrowdFund } from 'modules/web3/actions';
import { formToBackendData, formToContractData } from './utils';

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

export function resetForm() {
  return async (dispatch: Dispatch<any>) => {
    // TODO: Replace with server side reset
    localStorage.removeItem(LS_DRAFT_KEY);
    await sleep(100);

    // Re-run fetch draft to ensure we've reset state
    dispatch({ type: types.RESET_FORM });
    dispatch(fetchDraft());
  };
}

export function saveDraft() {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    const { form } = getState().create;
    dispatch({ type: types.SAVE_DRAFT_PENDING });
    await sleep(100);

    // TODO: Replace with server side save
    localStorage.setItem(LS_DRAFT_KEY, JSON.stringify(form));
    dispatch({ type: types.SAVE_DRAFT_FULFILLED });
  };
}

export function fetchDraft() {
  return async (dispatch: Dispatch<any>) => {
    dispatch({ type: types.FETCH_DRAFT_PENDING });
    await sleep(200);

    // TODO: Replace with server side fetch
    const formJson = localStorage.getItem(LS_DRAFT_KEY);
    try {
      const form = formJson ? JSON.parse(formJson) : null;
      dispatch({
        type: types.FETCH_DRAFT_FULFILLED,
        payload: form,
      });
    } catch (err) {
      localStorage.removeItem(LS_DRAFT_KEY);
      dispatch({
        type: types.FETCH_DRAFT_REJECTED,
        payload: 'Malformed form JSON',
        error: true,
      });
    }
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
