import React from 'react';
import { connect } from 'react-redux';
import { Spin, Button } from 'antd';
import { AppState } from 'store/reducers';
import { ProposalWithCrowdFund } from 'modules/proposals/reducers';
import { fetchProposalComments, postProposalComment } from 'modules/proposals/actions';
import {
  getProposalComments,
  getIsFetchingComments,
  getCommentsError,
} from 'modules/proposals/selectors';
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
    const { proposalId, comments, isFetchingComments, commentsError } = this.props;
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
        content = <Comments comments={comments} proposalId={proposalId} />;
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

export default connect(
  (state: AppState, ownProps: OwnProps) => ({
    comments: getProposalComments(state, ownProps.proposalId),
    isFetchingComments: getIsFetchingComments(state),
    commentsError: getCommentsError(state),
  }),
  {
    fetchProposalComments,
    postProposalComment,
  },
)(ProposalComments);
