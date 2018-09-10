import React from 'react';
import moment from 'moment';
import Markdown from 'react-markdown';
import { Comment as IComment } from 'modules/proposals/reducers';
import * as Styled from './styled';

interface Props {
  comment: IComment;
}

export default class Comment extends React.Component<Props> {
  public render(): React.ReactNode {
    const { comment } = this.props;
    return (
      <Styled.Container>
        <Styled.Info>
          <Styled.InfoThumb src={comment.author.avatar['120x120']} />
          <Styled.InfoName>{comment.author.username}</Styled.InfoName>
          <Styled.InfoTime>
            {moment(comment.dateCreated * 1000).fromNow()}
          </Styled.InfoTime>
        </Styled.Info>

        <Styled.Body>
          <Markdown source={comment.body} />
        </Styled.Body>

        <Styled.Controls>
          <Styled.ControlButton>Reply</Styled.ControlButton>
          {/*<Styled.ControlButton>Report</Styled.ControlButton>*/}
        </Styled.Controls>

        {comment.replies && (
          <Styled.Replies>
            {comment.replies.map(reply => (
              <Comment key={reply.commentId} comment={reply} />
            ))}
          </Styled.Replies>
        )}
      </Styled.Container>
    );
  }
}
