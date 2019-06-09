import types from './types';
import { cloneDeep } from 'lodash';
import { pendingMoreablePage, fulfilledMoreablePage } from 'utils/helpers';
import {
  Proposal,
  ProposalUpdates,
  Comment,
  ProposalContributions,
  LoadableProposalPage,
  Moreable,
} from 'types';
import { PROPOSAL_SORT } from 'api/constants';

export interface ProposalDetail extends Proposal {
  isRequestingPayout: boolean;
  requestPayoutError: string;
  isRejectingPayout: boolean;
  rejectPayoutError: string;
  isAcceptingPayout: boolean;
  acceptPayoutError: string;
}

export interface ProposalState {
  page: LoadableProposalPage;

  detail: null | ProposalDetail;
  isFetchingDetail: boolean;
  detailError: null | string;

  detailComments: Moreable<Comment>;

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

export const PROPOSAL_DETAIL_INITIAL_STATE = {
  isRequestingPayout: false,
  requestPayoutError: '',
  isRejectingPayout: false,
  rejectPayoutError: '',
  isAcceptingPayout: false,
  acceptPayoutError: '',
};

export const INITIAL_STATE: ProposalState = {
  page: {
    page: 1,
    pageSize: 0,
    total: 0,
    search: '',
    sort: PROPOSAL_SORT.NEWEST,
    filters: {
      category: [],
      stage: [],
    },
    items: [],
    hasFetched: false,
    isFetching: false,
    fetchError: null,
    fetchTime: 0,
  },

  detail: null,
  isFetchingDetail: false,
  detailError: null,

  detailComments: {
    pages: [],
    hasMore: false,
    page: 1,
    pageSize: 0,
    total: 0,
    search: '',
    sort: '',
    filters: [],
    isFetching: false,
    hasFetched: false,
    fetchError: '',
    fetchTime: 0,
    parentId: null,
  },

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
  const { comment, parentCommentId } = payload;
  // clone so we can mutate with great abandon!
  const pages = cloneDeep(state.detailComments.pages);
  if (!parentCommentId) {
    // its a new comment, pop it into the very first position
    if (pages[0]) {
      pages[0].unshift(comment);
    } else {
      pages[0] = [comment];
    }
  } else {
    // recursive populate replies for nested comment
    const f = (id: number, p: Comment) => {
      if (p.id === id) {
        p.replies.unshift(comment);
        return;
      } else {
        p.replies.forEach(x => f(id, x));
      }
    };
    // pages > page > comments
    pages.forEach(p =>
      p.forEach(c => {
        f(parentCommentId, c);
      }),
    );
  }
  return {
    ...state,
    isPostCommentPending: false,
    detailComments: {
      ...state.detailComments,
      pages,
      total: state.detailComments.total + 1,
    },
  };
}

function updateCommentInStore(
  state: ProposalState,
  commentId: Comment['id'],
  update: Partial<Comment>,
) {
  // clone so we can mutate with great abandon!
  const pages = cloneDeep(state.detailComments.pages);
  // recursive populate replies for nested comment
  const f = (id: number, p: Comment) => {
    if (p.id === id) {
      Object.entries(update).forEach(([k, v]) => {
        (p as any)[k] = v;
      });
      return;
    } else {
      p.replies.forEach(x => f(id, x));
    }
  };
  // pages > page > comments
  pages.forEach(p =>
    p.forEach(c => {
      f(commentId, c);
    }),
  );

  return {
    ...state,
    isPostCommentPending: false,
    detailComments: {
      ...state.detailComments,
      pages,
      total: state.detailComments.total + 1,
    },
  };
}

export default (state = INITIAL_STATE, action: any) => {
  const { payload } = action;
  switch (action.type) {
    case types.SET_PROPOSAL_PAGE:
      return {
        ...state,
        page: {
          ...state.page,
          ...payload,
          page: payload.page || 1, // reset page to 1 for non-page changes
        },
      };
    case types.PROPOSALS_DATA_PENDING:
      return {
        ...state,
        page: {
          ...state.page,
          isFetching: true,
          fetchError: null,
        },
      };
    case types.PROPOSALS_DATA_FULFILLED:
      return {
        ...state,
        page: {
          ...payload,
          isFetching: false,
          hasFetched: true,
          fetchTime: Date.now(),
        },
      };
    case types.PROPOSALS_DATA_REJECTED:
      return {
        ...state,
        page: {
          ...state.page,
          isFetching: false,
          hasFetched: false,
          fetchError: (payload && payload.message) || payload.toString(),
        },
      };

    case types.PROPOSAL_DATA_PENDING:
      // check if this proposal is in the page list, and optimistically set it
      const loadedInPage = state.page.items.find(
        p => p.proposalId === payload.proposalId,
      );
      return {
        ...state,
        detail:
          // if requesting same proposal, leave the detail object
          state.detail && state.detail.proposalId === payload.proposalId
            ? state.detail
            : { ...loadedInPage, ...PROPOSAL_DETAIL_INITIAL_STATE } || null,
        isFetchingDetail: true,
        detailError: null,
      };
    case types.PROPOSAL_DATA_FULFILLED:
      return {
        ...state,
        detail: { ...payload, ...PROPOSAL_DETAIL_INITIAL_STATE },
        isFetchingDetail: false,
      };
    case types.PROPOSAL_DATA_REJECTED:
      return {
        ...state,
        detail: null,
        isFetchingDetail: false,
        detailError: (payload && payload.message) || payload.toString(),
      };

    case types.PROPOSAL_PAYOUT_REQUEST_PENDING:
      return {
        ...state,
        detail: {
          ...state.detail,
          isRequestingPayout: true,
          requestPayoutError: '',
        },
      };
    case types.PROPOSAL_PAYOUT_REQUEST_FULFILLED:
      return {
        ...state,
        detail: { ...payload, ...PROPOSAL_DETAIL_INITIAL_STATE },
      };
    case types.PROPOSAL_PAYOUT_REQUEST_REJECTED:
      return {
        ...state,
        detail: {
          ...state.detail,
          isRequestingPayout: false,
          requestPayoutError: (payload && payload.message) || payload.toString(),
        },
      };

    case types.PROPOSAL_PAYOUT_REJECT_PENDING:
      return {
        ...state,
        detail: {
          ...state.detail,
          isRejectingPayout: true,
          rejectPayoutError: '',
        },
      };
    case types.PROPOSAL_PAYOUT_REJECT_FULFILLED:
      return {
        ...state,
        detail: { ...payload, ...PROPOSAL_DETAIL_INITIAL_STATE },
      };
    case types.PROPOSAL_PAYOUT_REJECT_REJECTED:
      return {
        ...state,
        detail: {
          ...state.detail,
          isRejectingPayout: false,
          rejectPayoutError: (payload && payload.message) || payload.toString(),
        },
      };

    case types.PROPOSAL_PAYOUT_ACCEPT_PENDING:
      return {
        ...state,
        detail: {
          ...state.detail,
          isAcceptingPayout: true,
          acceptPayoutError: '',
        },
      };
    case types.PROPOSAL_PAYOUT_ACCEPT_FULFILLED:
      return {
        ...state,
        detail: { ...payload, ...PROPOSAL_DETAIL_INITIAL_STATE },
      };
    case types.PROPOSAL_PAYOUT_ACCEPT_REJECTED:
      return {
        ...state,
        detail: {
          ...state.detail,
          isAcceptingPayout: false,
          acceptPayoutError: (payload && payload.message) || payload.toString(),
        },
      };

    case types.PROPOSAL_COMMENTS_PENDING:
      return {
        ...state,
        detailComments: pendingMoreablePage(state.detailComments, payload),
      };
    case types.PROPOSAL_COMMENTS_FULFILLED:
      return {
        ...state,
        detailComments: fulfilledMoreablePage(state.detailComments, payload),
      };
    case types.PROPOSAL_COMMENTS_REJECTED:
      return {
        ...state,
        detailComments: {
          ...state.detailComments,
          hasFetched: true,
          isFetching: false,
          fetchError: (payload && payload.message) || payload.toString(),
        },
      };

    case types.REPORT_PROPOSAL_COMMENT_FULFILLED:
      return updateCommentInStore(state, payload.commentId, { reported: true });

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
        updatesError: (payload && payload.message) || payload.toString(),
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
        fetchContributionsError: (payload && payload.message) || payload.toString(),
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
