import { AppState } from 'store/reducers';
import { RFP } from 'types';

export function getRfp(state: AppState, rfpId: RFP['id']) {
  return state.rfps.rfps.find(rfp => rfp.id === rfpId);
}
