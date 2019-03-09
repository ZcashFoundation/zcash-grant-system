import React from 'react';
import { connect } from 'react-redux';
import { Button, message, Skeleton, Alert } from 'antd';
import { AppState } from 'store/reducers';
import { Proposal } from 'types';
import { fetchProposalComments, postProposalComment } from 'modules/proposals/actions';
import { getIsVerified, getIsSignedIn } from 'modules/auth/selectors';
import Comments from 'components/Comments';
import Placeholder from 'components/Placeholder';
import MarkdownEditor, { MARKDOWN_TYPE } from 'components/MarkdownEditor';
import './index.less';

interface OwnProps {
  proposalId: Proposal['proposalId'];
}

interface StateProps {
  detailComments: AppState['proposal']['detailComments'];
  isPostCommentPending: AppState['proposal']['isPostCommentPending'];
  postCommentError: AppState['proposal']['postCommentError'];
  isVerified: ReturnType<typeof getIsVerified>;
  isSignedIn: ReturnType<typeof getIsSignedIn>;
}

interface DispatchProps {
  fetchProposalComments: typeof fetchProposalComments;
  postProposalComment: typeof postProposalComment;
}

type Props = DispatchProps & OwnProps & StateProps;

interface State {
  comment: string;
  curtainsMatchDrapes: boolean;
}

class ProposalComments extends React.Component<Props, State> {
  state: State = {
    comment: '',
    curtainsMatchDrapes: this.props.detailComments.parentId === this.props.proposalId,
  };

  private editor: MarkdownEditor | null = null;

  componentDidMount() {
    if (!this.state.curtainsMatchDrapes) {
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
    const { detailComments, isPostCommentPending, isVerified, isSignedIn } = this.props;
    const { comment } = this.state;
    let content = null;

    const { hasFetched, isFetching, hasMore, pages, fetchError, total } = detailComments;
    if (!hasFetched) {
      content = [1, 2, 3].map(i => (
        <Skeleton
          className="ProposalComments-skellie"
          key={i}
          active
          avatar={{ shape: 'square' }}
          paragraph={{ rows: 2 }}
        />
      ));
    } else if (total) {
      content = (
        <>
          {pages.map((p, i) => (
            <Comments key={i} comments={p} />
          ))}
          <div>
            {hasMore && (
              <Button
                onClick={() => this.props.fetchProposalComments()}
                loading={isFetching}
                block
              >
                Older Comments
              </Button>
            )}
          </div>
        </>
      );
    } else {
      content = (
        <Placeholder
          title="No comments have been made yet"
          subtitle="Why not be the first?"
        />
      );
    }

    return (
      <div className="ProposalComments">
        <div className="ProposalComments-post">
          {isVerified && (
            <>
              <MarkdownEditor
                ref={el => (this.editor = el)}
                onChange={this.handleCommentChange}
                type={MARKDOWN_TYPE.REDUCED}
                minHeight={100}
              />
              <Button
                onClick={this.postComment}
                disabled={!comment.length}
                loading={isPostCommentPending}
              >
                Submit comment
              </Button>
            </>
          )}
          {isSignedIn &&
            !isVerified && (
              <>
                <h4 className="ProposalComments-verify">
                  Please verify your email to post a comment.
                </h4>
                <MarkdownEditor
                  onChange={this.handleCommentChange}
                  type={MARKDOWN_TYPE.REDUCED}
                  readOnly={true}
                  minHeight={100}
                />
              </>
            )}
        </div>
        {content}
        {fetchError && (
          <Alert
            className="ProposalComments-alert"
            type="error"
            message="Oopsy, there was a problem loading comments!"
            description={fetchError}
          />
        )}
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
  state => ({
    detailComments: state.proposal.detailComments,
    isPostCommentPending: state.proposal.isPostCommentPending,
    postCommentError: state.proposal.postCommentError,
    isVerified: getIsVerified(state),
    isSignedIn: getIsSignedIn(state),
  }),
  {
    fetchProposalComments,
    postProposalComment,
  },
)(ProposalComments);
