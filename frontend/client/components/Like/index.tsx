import React from 'react';
import { connect } from 'react-redux';
import { Icon, Button, Input, message } from 'antd';
import { AppState } from 'store/reducers';
import { proposalActions } from 'modules/proposals';
import { rfpActions } from 'modules/rfps';
import { Proposal } from 'types';
import { Comment, RFP } from 'types';
import { likeProposal, likeComment, likeRfp } from 'api/api';
import AuthButton from 'components/AuthButton';
import classnames from 'classnames';
import './index.less';

interface OwnProps {
  proposal?: Proposal;
  proposal_card?: boolean;
  comment?: Comment;
  rfp?: RFP;
  style?: React.CSSProperties;
  className?: string;
}

interface StateProps {
  authUser: AppState['auth']['user'];
}

interface DispatchProps {
  fetchProposal: typeof proposalActions['fetchProposal'];
  updateComment: typeof proposalActions['updateProposalComment'];
  fetchRfp: typeof rfpActions['fetchRfp'];
}

type Props = OwnProps & StateProps & DispatchProps;

const STATE = {
  loading: false,
};
type State = typeof STATE;

class Like extends React.Component<Props, State> {
  state: State = { ...STATE };

  render() {
    const { likesCount, authedLiked } = this.deriveInfo();
    const { proposal, rfp, comment, style, proposal_card, className } = this.props;
    const { loading } = this.state;
    const zoom = comment || proposal_card ? 0.8 : 1;
    const shouldShowLikeText = (!!proposal && !proposal_card) || !!rfp;

    // if like button is on a proposal card...
    // 1) use regular button to prevent login redirect
    const IconButton = proposal_card ? Button : AuthButton;
    // 2) prevent mouseover effects
    const pointerEvents = proposal_card ? 'none' : undefined;
    // 3) make button click a noop
    const handleIconButtonClick = proposal_card ? undefined : this.handleLike;

    return (
      <Input.Group
        className={classnames('Like', className)}
        compact
        style={{ zoom, pointerEvents, ...style }}
      >
        <IconButton onClick={handleIconButtonClick}>
          <Icon
            theme={authedLiked ? 'filled' : 'outlined'}
            type={loading ? 'loading' : 'like'}
          />
          {shouldShowLikeText && (
            <span className="Like-label">{authedLiked ? ' Unlike' : ' Like'}</span>
          )}
        </IconButton>
        <Button className="Like-count" disabled>
          <span>{likesCount}</span>
        </Button>
      </Input.Group>
    );
  }

  private deriveInfo = () => {
    let authedLiked = false;
    let likesCount = 0;

    const { proposal, comment, rfp } = this.props;

    if (comment) {
      authedLiked = comment.authedLiked;
      likesCount = comment.likesCount;
    } else if (proposal) {
      authedLiked = proposal.authedLiked;
      likesCount = proposal.likesCount;
    } else if (rfp) {
      authedLiked = rfp.authedLiked;
      likesCount = rfp.likesCount;
    }

    return {
      authedLiked,
      likesCount,
    };
  };

  private handleLike = () => {
    if (this.state.loading) return;
    const { proposal, rfp, comment } = this.props;

    if (proposal) {
      return this.handleProposalLike();
    }
    if (comment) {
      return this.handleCommentLike();
    }
    if (rfp) {
      return this.handleRfpLike();
    }
  };

  private handleProposalLike = async () => {
    if (!this.props.proposal) return;

    const {
      proposal: { proposalId, authedLiked },
      fetchProposal,
    } = this.props;

    this.setState({ loading: true });
    try {
      await likeProposal(proposalId, !authedLiked);
      await fetchProposal(proposalId);
    } catch (error) {
      // tslint:disable:no-console
      console.error('Like.handleProposalLike - unable to change like state', error);
      message.error('Unable to like proposal');
    }
    this.setState({ loading: false });
  };

  private handleCommentLike = async () => {
    if (!this.props.comment) return;

    const {
      comment: { id, authedLiked },
      updateComment,
    } = this.props;

    this.setState({ loading: true });
    try {
      const updatedComment = await likeComment(id, !authedLiked);
      updateComment(id, updatedComment);
      message.success(<>Comment {authedLiked ? 'unliked' : 'liked'}</>);
    } catch (error) {
      // tslint:disable:no-console
      console.error('Like.handleCommentLike - unable to change like state', error);
      message.error('Unable to like comment');
    }
    this.setState({ loading: false });
  };

  private handleRfpLike = async () => {
    if (!this.props.rfp) return;

    const {
      rfp: { id, authedLiked },
      fetchRfp,
    } = this.props;

    this.setState({ loading: true });
    try {
      await likeRfp(id, !authedLiked);
      await fetchRfp(id);
      message.success(<>Request for proposal {authedLiked ? 'unliked' : 'liked'}</>);
    } catch (error) {
      // tslint:disable:no-console
      console.error('Like.handleRfpLike - unable to change like state', error);
      message.error('Unable to like rfp');
    }
    this.setState({ loading: false });
  };
}

const withConnect = connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    authUser: state.auth.user,
  }),
  {
    fetchProposal: proposalActions.fetchProposal,
    updateComment: proposalActions.updateProposalComment,
    fetchRfp: rfpActions.fetchRfp,
  },
);

export default withConnect(Like);
