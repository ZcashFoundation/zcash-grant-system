import { AppState as S } from 'store/reducers';

export const getDrafts = (s: S) => s.ccr.drafts;
export const getDraftsFetchError = (s: S) => s.ccr.fetchDraftsError;

export const getDraftById = (s: S, id: number) => {
  const drafts = getDrafts(s) || [];
  return drafts.find(d => d.ccrId === id);
};

export const getFormState = (s: S) => s.ccr.form;
