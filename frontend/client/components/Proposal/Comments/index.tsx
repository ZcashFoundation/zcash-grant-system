import React from 'react';
import { connect } from 'react-redux';
import { Spin, Icon } from 'antd';
import { AppState } from 'store/reducers';
import { ProposalWithCrowdFund } from 'modules/proposals/reducers';
import { fetchProposalComments } from 'modules/proposals/actions';
import {
  getProposalComments,
  getIsFetchingComments,
  getCommentsError,
} from 'modules/proposals/selectors';
import Comments from 'components/Comments';
import * as Styled from './styled';

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
}

type Props = DispatchProps & OwnProps & StateProps;

class ProposalComments extends React.Component<Props> {
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
    const { comments, isFetchingComments, commentsError } = this.props;
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
        content = (
          <>
            <Comments comments={comments} />
            <Styled.ForumButton>
              Join the conversation <Icon type="message" />
            </Styled.ForumButton>
          </>
        );
      } else {
        content = <h2>No comments have been made yet</h2>;
      }
    }

    return content;
  }
}

export default connect(
  (state: AppState, ownProps: OwnProps) => ({
    comments: getProposalComments(state, ownProps.proposalId),
    isFetchingComments: getIsFetchingComments(state),
    commentsError: getCommentsError(state),
  }),
  {
    fetchProposalComments,
  },
)(ProposalComments);
