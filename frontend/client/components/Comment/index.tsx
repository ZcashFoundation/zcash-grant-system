import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button } from 'antd';
import Markdown from 'components/Markdown';
import Identicon from 'components/Identicon';
import MarkdownEditor, { MARKDOWN_TYPE } from 'components/MarkdownEditor';
import { postProposalComment } from 'modules/proposals/actions';
import { Comment as IComment, Proposal } from 'modules/proposals/reducers';
import { AppState } from 'store/reducers';
import * as Styled from './styled';

interface OwnProps {
  comment: IComment;
  proposalId: Proposal['proposalId'];
}

interface StateProps {
  isPostCommentPending: AppState['proposal']['isPostCommentPending'];
  postCommentError: AppState['proposal']['postCommentError'];
}

interface DispatchProps {
  postProposalComment: typeof postProposalComment;
}

type Props = OwnProps & StateProps & DispatchProps;

interface State {
  reply: string;
  isReplying: boolean;
}

class Comment extends React.Component<Props> {
  state: State = {
    reply: '',
    isReplying: false,
  };

  componentDidUpdate(prevProps: Props) {
    // TODO: Come up with better check on if our comment post was a success
    const { isPostCommentPending, postCommentError } = this.props;
    if (!isPostCommentPending && !postCommentError && prevProps.isPostCommentPending) {
      this.setState({ reply: '', isReplying: false });
    }
  }

  public render(): React.ReactNode {
    const { comment, proposalId } = this.props;
    const { isReplying, reply } = this.state;
    return (
      <Styled.Container>
        <Styled.Info>
          <Styled.InfoThumb>
            <Identicon address={comment.author.accountAddress} />
          </Styled.InfoThumb>
          {/* <Styled.InfoThumb src={comment.author.avatar['120x120']} /> */}
          <Styled.InfoName>{comment.author.username}</Styled.InfoName>
          <Styled.InfoTime>{moment(comment.dateCreated).fromNow()}</Styled.InfoTime>
        </Styled.Info>

        <Styled.Body>
          <Markdown source={comment.body} type={MARKDOWN_TYPE.REDUCED} />
        </Styled.Body>

        <Styled.Controls>
          <Styled.ControlButton onClick={this.toggleReply}>
            {isReplying ? 'Cancel' : 'Reply'}
          </Styled.ControlButton>
          {/*<Styled.ControlButton>Report</Styled.ControlButton>*/}
        </Styled.Controls>

        {(comment.replies.length || isReplying) && (
          <Styled.Replies>
            {isReplying && (
              <Styled.ReplyForm>
                <MarkdownEditor
                  onChange={this.handleChangeReply}
                  type={MARKDOWN_TYPE.REDUCED}
                />
                <div style={{ marginTop: '0.5rem' }} />
                <Button onClick={this.reply} disabled={!reply.length}>
                  Submit reply
                </Button>
              </Styled.ReplyForm>
            )}
            {comment.replies.map(subComment => (
              <ConnectedComment
                key={subComment.commentId}
                comment={subComment}
                proposalId={proposalId}
              />
            ))}
          </Styled.Replies>
        )}
      </Styled.Container>
    );
  }

  private toggleReply = () => {
    this.setState({ isReplying: !this.state.isReplying });
  };

  private handleChangeReply = (reply: string) => {
    this.setState({ reply });
  };

  private reply = () => {
    const { comment, proposalId } = this.props;
    const { reply } = this.state;
    this.props.postProposalComment(proposalId, reply, comment.commentId);
  };
}

const ConnectedComment = connect<StateProps, DispatchProps, OwnProps, AppState>(
  (state: AppState) => ({
    isPostCommentPending: state.proposal.isPostCommentPending,
    postCommentError: state.proposal.postCommentError,
  }),
  {
    postProposalComment,
  },
)(Comment);

export default ConnectedComment;
