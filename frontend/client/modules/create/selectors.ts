import { AppState as S } from 'store/reducers';

export const getDraftById = (s: S, id: number) => {
  if (!s.create.drafts) {
    return undefined;
  }
  return s.create.drafts.find(d => d.proposalId === id);
};
