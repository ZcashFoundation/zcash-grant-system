import React from 'react';
import { Proposal, ProposalComments } from 'modules/proposals/reducers';
import Comment from 'components/Comment';

interface Props {
  comments: ProposalComments['comments'];
  proposalId: Proposal['proposalId'];
}

const Comments = ({ comments, proposalId }: Props) => (
  <React.Fragment>
    {comments.map(c => (
      <Comment key={c.commentId} comment={c} proposalId={proposalId} />
    ))}
  </React.Fragment>
);

export default Comments;
