import { AppState as S } from 'store/reducers';

export const getDrafts = (s: S) => s.create.drafts;
export const getDraftsFetchError = (s: S) => s.create.fetchDraftsError;

export const getDraftById = (s: S, id: number) => {
  const drafts = getDrafts(s) || [];
  return drafts.find(d => d.proposalId === id);
};

export const getFormState = (s: S) => s.create.form;
