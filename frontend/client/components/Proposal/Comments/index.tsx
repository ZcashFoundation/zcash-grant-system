import React from 'react';
import { connect } from 'react-redux';
import { Spin, Button } from 'antd';
import { AppState } from 'store/reducers';
import { ProposalWithCrowdFund } from 'types';
import { fetchProposalComments, postProposalComment } from 'modules/proposals/actions';
import {
  getProposalComments,
  getIsFetchingComments,
  getCommentsError,
} from 'modules/proposals/selectors';
import { getIsSignedIn } from 'modules/auth/selectors';
import Comments from 'components/Comments';
import Placeholder from 'components/Placeholder';
import MarkdownEditor, { MARKDOWN_TYPE } from 'components/MarkdownEditor';
import './style.less';

interface OwnProps {
  proposalId: ProposalWithCrowdFund['proposalId'];
}

interface StateProps {
  comments: ReturnType<typeof getProposalComments>;
  isFetchingComments: ReturnType<typeof getIsFetchingComments>;
  commentsError: ReturnType<typeof getCommentsError>;
  isSignedIn: ReturnType<typeof getIsSignedIn>;
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

  render() {
    const { comments, isFetchingComments, commentsError, isSignedIn } = this.props;
    const { comment } = this.state;
    let content = null;

    if (isFetchingComments) {
      content = <Spin />;
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
      <>
        {isSignedIn && (
          <div className="ProposalComments-post">
            <MarkdownEditor
              onChange={this.handleCommentChange}
              type={MARKDOWN_TYPE.REDUCED}
            />
            <div style={{ marginTop: '0.5rem' }} />
            <Button onClick={this.postComment} disabled={!comment.length}>
              Submit comment
            </Button>
          </div>
        )}
        {content}
      </>
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
    isSignedIn: getIsSignedIn(state),
  }),
  {
    fetchProposalComments,
    postProposalComment,
  },
)(ProposalComments);
