export const PROPOSAL_OTHER_FILTERS = [
  {
    id: 'ARBITER',
    filterDisplay: 'Arbiter: missing',
    tagColor: '#cf00d5',
  },
];
export function getProposalOtherFilterById(id: string) {
  const res = PROPOSAL_OTHER_FILTERS.find(x => x.id === id);
  if (!res) {
    throw Error(`getOtherProposalFilterById: could not find other filter for '${id}'`);
  }
  return res;
}
