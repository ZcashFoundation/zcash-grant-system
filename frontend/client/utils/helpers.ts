import { pick } from 'lodash';
import { Comment } from 'types';

export function isNumeric(n: any) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function findComment(
  commentId: Comment['commentId'],
  comments: Comment[],
): Comment | null {
  for (const comment of comments) {
    if (comment.commentId === commentId) {
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
