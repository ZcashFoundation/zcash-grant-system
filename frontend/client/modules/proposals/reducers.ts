import types from './types';
import { findComment } from 'utils/helpers';
import { Proposal, ProposalComments, ProposalUpdates, Comment, ProposalContributions } from 'types';

export interface ProposalState {
  proposals: Proposal[];
  proposalsError: null | string;
  isFetchingProposals: boolean;

  proposalComments: { [id: string]: ProposalComments };
  commentsError: null | string;
  isFetchingComments: boolean;

  proposalUpdates: { [id: string]: ProposalUpdates };
  updatesError: null | string;
  isFetchingUpdates: boolean;

  proposalContributions: { [id: string]: ProposalContributions };
  fetchContributionsError: null | string;
  isFetchingContributions: boolean;

  isPostCommentPending: boolean;
  postCommentError: null | string;

  isDeletingContribution: boolean;
  deleteContributionError: null | string;
}

export const INITIAL_STATE: ProposalState = {
  proposals: [],
  proposalsError: null,
  isFetchingProposals: false,

  proposalComments: {},
  commentsError: null,
  isFetchingComments: false,

  proposalUpdates: {},
  updatesError: null,
  isFetchingUpdates: false,

  proposalContributions: {},
  fetchContributionsError: null,
  isFetchingContributions: false,

  isPostCommentPending: false,
  postCommentError: null,

  isDeletingContribution: false,
  deleteContributionError: null,
};

function addProposal(state: ProposalState, payload: Proposal) {
  let proposals = state.proposals;

  const existingProposal = state.proposals.find(
    (p: Proposal) => p.proposalId === payload.proposalId,
  );

  if (!existingProposal) {
    proposals = proposals.concat(payload);
  } else {
    proposals = [...proposals];
    const index = proposals.indexOf(existingProposal);
    proposals[index] = payload;
  }

  return {
    ...state,
    ...{
      proposals,
    },
  };
}

function addProposals(state: ProposalState, payload: Proposal[]) {
  return {
    ...state,
    proposals: payload,
    isFetchingProposals: false,
  };
}

function addComments(state: ProposalState, payload: { data: ProposalComments }) {
  return {
    ...state,
    proposalComments: {
      ...state.proposalComments,
      [payload.data.proposalId]: payload.data,
    },
    isFetchingComments: false,
  };
}

function addUpdates(state: ProposalState, payload: ProposalUpdates) {
  return {
    ...state,
    proposalUpdates: {
      ...state.proposalUpdates,
      [payload.proposalId]: payload,
    },
    isFetchingUpdates: false,
  };
}

function addContributions(state: ProposalState, payload: ProposalContributions) {
  return {
    ...state,
    proposalContributions: {
      ...state.proposalContributions,
      [payload.proposalId]: payload,
    },
    isFetchingContributions: false,
  };
}

interface PostCommentPayload {
  proposalId: Proposal['proposalId'];
  comment: Comment;
  parentCommentId?: Comment['id'];
}
function addPostedComment(state: ProposalState, payload: PostCommentPayload) {
  const { proposalId, comment, parentCommentId } = payload;
  const newComments = state.proposalComments[proposalId]
    ? {
        ...state.proposalComments[proposalId],
        totalComments: state.proposalComments[proposalId].totalComments + 1,
        comments: [...state.proposalComments[proposalId].comments],
      }
    : {
        proposalId: payload.proposalId,
        totalComments: 1,
        comments: [],
      };

  if (parentCommentId) {
    const parentComment = findComment(parentCommentId, newComments.comments);
    if (parentComment) {
      // FIXME: Object mutation because I'm lazy, but this probably shouldn’t
      // exist once API hookup is done. We'll just re-request from server.
      parentComment.replies.unshift(comment);
    }
  } else {
    newComments.comments.unshift(comment);
  }

  return {
    ...state,
    isPostCommentPending: false,
    proposalComments: {
      ...state.proposalComments,
      [payload.proposalId]: newComments,
    },
  };
}

export default (state = INITIAL_STATE, action: any) => {
  const { payload } = action;
  switch (action.type) {
    case types.PROPOSALS_DATA_PENDING:
      return {
        ...state,
        proposals: [],
        proposalsError: null,
        isFetchingProposals: true,
      };
    case types.PROPOSALS_DATA_FULFILLED:
      return addProposals(state, payload);
    case types.PROPOSALS_DATA_REJECTED:
      return {
        ...state,
        // TODO: Get action to send real error
        proposalsError: 'Failed to fetch proposal',
        isFetchingProposals: false,
      };

    case types.PROPOSAL_DATA_FULFILLED:
      return addProposal(state, payload);

    case types.PROPOSAL_COMMENTS_PENDING:
      return {
        ...state,
        commentsError: null,
        isFetchingComments: true,
      };
    case types.PROPOSAL_COMMENTS_FULFILLED:
      return addComments(state, payload);
    case types.PROPOSAL_COMMENTS_REJECTED:
      return {
        ...state,
        // TODO: Get action to send real error
        commentsError: 'Failed to fetch comments',
        isFetchingComments: false,
      };

    case types.PROPOSAL_UPDATES_PENDING:
      return {
        ...state,
        updatesError: null,
        isFetchingUpdates: true,
      };
    case types.PROPOSAL_UPDATES_FULFILLED:
      return addUpdates(state, payload);
    case types.PROPOSAL_UPDATES_REJECTED:
      return {
        ...state,
        // TODO: Get action to send real error
        updatesError: 'Failed to fetch updates',
        isFetchingUpdates: false,
      };

    case types.PROPOSAL_CONTRIBUTIONS_PENDING:
      return {
        ...state,
        fetchContributionsError: null,
        isFetchingContributions: true,
      };
    case types.PROPOSAL_CONTRIBUTIONS_FULFILLED:
      return addContributions(state, payload);
    case types.PROPOSAL_CONTRIBUTIONS_REJECTED:
      return {
        ...state,
        // TODO: Get action to send real error
        fetchContributionsError: 'Failed to fetch updates',
        isFetchingContributions: false,
      };

    case types.POST_PROPOSAL_COMMENT_PENDING:
      return {
        ...state,
        isPostCommentPending: true,
        postCommentError: null,
      };
    case types.POST_PROPOSAL_COMMENT_FULFILLED:
      return addPostedComment(state, payload);
    case types.POST_PROPOSAL_COMMENT_REJECTED:
      return {
        ...state,
        isPostCommentPending: false,
        postCommentError: payload,
      };

    default:
      return state;
  }
};
