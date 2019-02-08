import React from 'react';
import { connect } from 'react-redux';
import { Button, message } from 'antd';
import { AppState } from 'store/reducers';
import { Proposal } from 'types';
import { fetchProposalComments, postProposalComment } from 'modules/proposals/actions';
import {
  getCommentsError,
  getIsFetchingComments,
  getProposalComments,
} from 'modules/proposals/selectors';
import { getIsVerified } from 'modules/auth/selectors';
import Comments from 'components/Comments';
import Placeholder from 'components/Placeholder';
import Loader from 'components/Loader';
import MarkdownEditor, { MARKDOWN_TYPE } from 'components/MarkdownEditor';
import './style.less';

interface OwnProps {
  proposalId: Proposal['proposalId'];
}

interface StateProps {
  comments: ReturnType<typeof getProposalComments>;
  isFetchingComments: ReturnType<typeof getIsFetchingComments>;
  commentsError: ReturnType<typeof getCommentsError>;
  isPostCommentPending: AppState['proposal']['isPostCommentPending'];
  postCommentError: AppState['proposal']['postCommentError'];
  isVerified: ReturnType<typeof getIsVerified>;
}

interface DispatchProps {
  fetchProposalComments: typeof fetchProposalComments;
  postProposalComment: typeof postProposalComment;
}

type Props = DispatchProps & OwnProps & StateProps;

interface State {
  comment: string;
}

class ProposalComments extends React.Component<Props, State> {
  state: State = {
    comment: '',
  };

  private editor: MarkdownEditor | null = null;

  componentDidMount() {
    if (this.props.proposalId) {
      this.props.fetchProposalComments(this.props.proposalId);
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.proposalId && nextProps.proposalId !== this.props.proposalId) {
      this.props.fetchProposalComments(nextProps.proposalId);
    }
  }

  componentDidUpdate(prevProps: Props) {
    // TODO: Come up with better check on if our comment post was a success
    const { isPostCommentPending, postCommentError } = this.props;
    if (!isPostCommentPending && !postCommentError && prevProps.isPostCommentPending) {
      this.setState({ comment: '' });
      this.editor!.reset();
    }

    if (postCommentError && postCommentError !== prevProps.postCommentError) {
      message.error(postCommentError);
    }
  }

  render() {
    const {
      comments,
      isFetchingComments,
      commentsError,
      isPostCommentPending,
      isVerified,
    } = this.props;
    const { comment } = this.state;
    let content = null;

    if (isFetchingComments) {
      content = <Loader />;
    } else if (commentsError) {
      content = (
        <>
          <h2>Something went wrong</h2>
          <p>{commentsError}</p>
        </>
      );
    } else if (comments) {
      if (comments.length) {
        content = <Comments comments={comments} />;
      } else {
        content = (
          <Placeholder
            title="No comments have been made yet"
            subtitle="Why not be the first?"
          />
        );
      }
    }

    return (
      <div>
        <div className="ProposalComments-post">
          {isVerified ? (
            <>
              <MarkdownEditor
                ref={el => (this.editor = el)}
                onChange={this.handleCommentChange}
                type={MARKDOWN_TYPE.REDUCED}
              />
              <div style={{ marginTop: '0.5rem' }} />
              <Button
                onClick={this.postComment}
                disabled={!comment.length}
                loading={isPostCommentPending}
              >
                Submit comment
              </Button>
            </>
          ) : (
            <>
              <h4 className="ProposalComments-verify">
                Please verify your email to post a comment.
              </h4>
              <MarkdownEditor
                ref={el => (this.editor = el)}
                onChange={this.handleCommentChange}
                type={MARKDOWN_TYPE.REDUCED}
                readOnly={true}
              />
            </>
          )}
        </div>
        {content}
      </div>
    );
  }

  private handleCommentChange = (comment: string) => {
    this.setState({ comment });
  };

  private postComment = () => {
    this.props.postProposalComment(this.props.proposalId, this.state.comment);
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  (state, ownProps) => ({
    comments: getProposalComments(state, ownProps.proposalId),
    isFetchingComments: getIsFetchingComments(state),
    commentsError: getCommentsError(state),
    isPostCommentPending: state.proposal.isPostCommentPending,
    postCommentError: state.proposal.postCommentError,
    isVerified: getIsVerified(state),
  }),
  {
    fetchProposalComments,
    postProposalComment,
  },
)(ProposalComments);
