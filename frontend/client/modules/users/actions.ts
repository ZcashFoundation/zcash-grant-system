import types, { UserProposal, UserComment } from './types';
import { getUser, getProposals } from 'api/api';
import { Dispatch } from 'redux';
import { Proposal } from 'modules/proposals/reducers';
import BN from 'bn.js';

export function fetchUser(userFetchId: string) {
  return async (dispatch: Dispatch<any>) => {
    dispatch({ type: types.FETCH_USER_PENDING, payload: { userFetchId } });
    try {
      const { data: user } = await getUser(userFetchId);
      dispatch({
        type: types.FETCH_USER_FULFILLED,
        payload: { userFetchId, user },
      });
    } catch (error) {
      dispatch({ type: types.FETCH_USER_REJECTED, payload: { userFetchId, error } });
    }
  };
}

export function fetchUserCreated(userFetchId: string) {
  return async (dispatch: Dispatch<any>) => {
    dispatch({ type: types.FETCH_USER_CREATED_PENDING, payload: { userFetchId } });
    try {
      // temporary, grab all proposals
      const proposalsRes = await getProposals();
      const proposals = proposalsRes.data.map(mockModifyProposals);
      dispatch({
        type: types.FETCH_USER_CREATED_FULFILLED,
        payload: { userFetchId, proposals },
      });
    } catch (error) {
      dispatch({
        type: types.FETCH_USER_CREATED_REJECTED,
        payload: { userFetchId, error },
      });
    }
  };
}

export function fetchUserFunded(userFetchId: string) {
  return async (dispatch: Dispatch<any>) => {
    dispatch({ type: types.FETCH_USER_FUNDED_PENDING, payload: { userFetchId } });
    try {
      // temporary, grab all proposals
      const proposalsRes = await getProposals();
      const proposals = proposalsRes.data.map(mockModifyProposals);
      dispatch({
        type: types.FETCH_USER_FUNDED_FULFILLED,
        payload: { userFetchId, proposals },
      });
    } catch (error) {
      dispatch({
        type: types.FETCH_USER_FUNDED_REJECTED,
        payload: { userFetchId, error },
      });
    }
  };
}

export function fetchUserComments(userFetchId: string) {
  return async (dispatch: Dispatch<any>) => {
    dispatch({ type: types.FETCH_USER_COMMENTS_PENDING, payload: { userFetchId } });
    try {
      // temporary, grab all proposals, mock comments
      const proposalsRes = await getProposals();
      const proposals = proposalsRes.data.map(mockModifyProposals);
      const comments = mockComments(proposals);
      comments.sort((a, b) => (a.dateCreated > b.dateCreated ? -1 : 1));
      dispatch({
        type: types.FETCH_USER_COMMENTS_FULFILLED,
        payload: { userFetchId, comments },
      });
    } catch (error) {
      dispatch({
        type: types.FETCH_USER_COMMENTS_REJECTED,
        payload: { userFetchId, error },
      });
    }
  };
}

const mockModifyProposals = (p: Proposal): UserProposal => {
  const { proposalId, title, team } = p;
  return {
    proposalId,
    title,
    team,
    funded: new BN('5000000000000000000'),
    target: new BN('10000000000000000000'),
    brief: genBrief(title),
  };
};

const genBrief = (title: string) => {
  return title.indexOf('T-Shirts') > -1
    ? 'Stylish, classy logo tees for Grant.io! Show everyone your love for the future of crowdfunding!'
    : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
};

const mockComments = (ps: UserProposal[]): UserComment[] => {
  return ps.reduce((a: UserComment[], p) => a.concat(mockComment(p)), []);
};

const mockComment = (p: UserProposal): UserComment[] => {
  return p.title.indexOf('T-Shirts') > -1
    ? [
        {
          commentId: Math.random(),
          body: "I can't WAIT to get my t-shirt!",
          dateCreated: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30),
          proposal: p,
        },
        {
          commentId: Math.random(),
          body: 'I love the new design. Will they still be available next month?',
          dateCreated: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30),
          proposal: p,
        },
      ]
    : [
        {
          commentId: Math.random(),
          body: 'Ut labore et dolore magna aliqua.',
          dateCreated: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30),
          proposal: p,
        },
        {
          commentId: Math.random(),
          body:
            'Adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          dateCreated: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30),
          proposal: p,
        },
        {
          commentId: Math.random(),
          body:
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
          dateCreated: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30),
          proposal: p,
        },
        {
          commentId: Math.random(),
          body:
            'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
          dateCreated: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30),
          proposal: p,
        },
      ];
};
