import { pick } from 'lodash';
import { Comment, Moreable, ServerPage } from 'types';

export function isNumeric(n: any) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function findComment(
  commentId: Comment['id'],
  comments: Comment[],
): Comment | null {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return comment;
    } else if (comment.replies.length) {
      const foundComment = findComment(commentId, comment.replies);
      if (foundComment) {
        return foundComment;
      }
    }
  }

  return null;
}

// clone and filter keys by keySource object's keys
export function cleanClone<T extends object>(keySource: T, target: Partial<T>) {
  const sourceKeys = Object.keys(keySource);
  const fullClone = { ...(target as object) };
  const clone = pick(fullClone, sourceKeys);
  return clone as T;
}

export function urlToPublic(url: string) {
  let withPublicHost = url.match(/^https?:/) ? url : process.env.PUBLIC_HOST_URL + url;
  if (process.env.NODE_ENV === 'development' && process.env.PUBLIC_HOST_URL) {
    withPublicHost = withPublicHost.replace(
      /^http:\/\/localhost(:\d+)/,
      process.env.PUBLIC_HOST_URL,
    );
  }
  return withPublicHost;
}

export function pendingMoreablePage<T>(
  state: Moreable<T>,
  params: Partial<Moreable<T>>,
): Moreable<T> {
  let newState: Partial<Moreable<T>> = {
    isFetching: true,
    page: state.page + 1,
    fetchError: '',
  };
  // if we ever use search, filter or sort we'll want to check those here
  if (state.parentId !== params.parentId) {
    // reset
    newState = {
      ...newState,
      parentId: params.parentId,
      pages: [],
      page: 1,
      pageSize: 0,
      total: 0,
      hasFetched: false,
    };
  }
  return {
    ...state,
    ...newState,
  };
}

export function fulfilledMoreablePage<T>(
  state: Moreable<T>,
  serverPage: ServerPage<T>,
): Moreable<T> {
  const { total, pageSize, page, items } = serverPage;
  let pages = [...state.pages, items];
  if (page !== state.pages.length + 1) {
    if (page === 1) {
      pages = [items];
    }
  }
  const hasMore = page * pageSize < total;
  return {
    ...state,
    total,
    pageSize,
    page,
    pages,
    hasMore,
    hasFetched: true,
    isFetching: false,
    fetchTime: Date.now(),
  };
}
