import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import Markdown from 'components/Markdown';
import UserAvatar from 'components/UserAvatar';
import MarkdownEditor, { MARKDOWN_TYPE } from 'components/MarkdownEditor';
import { postProposalComment } from 'modules/proposals/actions';
import { getIsSignedIn } from 'modules/auth/selectors';
import { Comment as IComment } from 'types';
import { AppState } from 'store/reducers';
import './style.less';

interface OwnProps {
  comment: IComment;
}

interface StateProps {
  isPostCommentPending: AppState['proposal']['isPostCommentPending'];
  postCommentError: AppState['proposal']['postCommentError'];
  isSignedIn: ReturnType<typeof getIsSignedIn>;
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
    const { comment, isSignedIn, isPostCommentPending } = this.props;
    const { isReplying, reply } = this.state;
    const authorPath = `/profile/${comment.author.accountAddress}`;
    return (
      <div className="Comment">
        <div className="Comment-info">
          <Link to={authorPath}>
            <div className="Comment-info-thumb">
              <UserAvatar user={comment.author} />
            </div>
          </Link>
          <Link to={authorPath}>
            <div className="Comment-info-name">{comment.author.displayName}</div>
          </Link>
          <div className="Comment-info-time">
            {moment.unix(comment.dateCreated).fromNow()}
          </div>
        </div>

        <div className="Comment-body">
          <Markdown source={comment.content} type={MARKDOWN_TYPE.REDUCED} />
        </div>

        {isSignedIn && (
          <div className="Comment-controls">
            <a className="Comment-controls-button" onClick={this.toggleReply}>
              {isReplying ? 'Cancel' : 'Reply'}
            </a>
            {/*<a className="Comment-controls-button">Report</a>*/}
          </div>
        )}

        {(comment.replies.length || isReplying) && (
          <div className="Comment-replies">
            {isReplying && (
              <div className="Comment-replies-form">
                <MarkdownEditor
                  onChange={this.handleChangeReply}
                  type={MARKDOWN_TYPE.REDUCED}
                />
                <div style={{ marginTop: '0.5rem' }} />
                <Button
                  onClick={this.reply}
                  disabled={!reply.length}
                  loading={isPostCommentPending}
                >
                  Submit reply
                </Button>
              </div>
            )}
            {comment.replies.map(subComment => (
              <ConnectedComment key={subComment.id} comment={subComment} />
            ))}
          </div>
        )}
      </div>
    );
  }

  private toggleReply = () => {
    this.setState({ isReplying: !this.state.isReplying });
  };

  private handleChangeReply = (reply: string) => {
    this.setState({ reply });
  };

  private reply = () => {
    const { comment } = this.props;
    const { reply } = this.state;
    this.props.postProposalComment(comment.proposalId, reply, comment.id);
  };
}

const ConnectedComment = connect<StateProps, DispatchProps, OwnProps, AppState>(
  (state: AppState) => ({
    isPostCommentPending: state.proposal.isPostCommentPending,
    postCommentError: state.proposal.postCommentError,
    isSignedIn: getIsSignedIn(state),
  }),
  {
    postProposalComment,
  },
)(Comment);

export default ConnectedComment;
