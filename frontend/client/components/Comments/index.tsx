import React from 'react';
import { ProposalComments } from 'types';
import Comment from 'components/Comment';

interface Props {
  comments: ProposalComments['comments'];
}

const Comments = ({ comments }: Props) => (
  <React.Fragment>
    {comments.map(c => (
      <Comment key={c.id} comment={c} />
    ))}
  </React.Fragment>
);

export default Comments;
