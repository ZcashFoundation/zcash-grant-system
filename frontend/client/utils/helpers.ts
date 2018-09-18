import { Comment } from 'modules/proposals/reducers';

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
