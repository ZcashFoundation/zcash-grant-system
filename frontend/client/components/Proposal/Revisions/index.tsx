import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import Placeholder from 'components/Placeholder';
import { AppState } from 'store/reducers';
import { Proposal, Revision, RevisionChange, REVISION_CHANGE_TYPES } from 'types';
import { fetchProposalRevisions } from 'modules/proposals/actions';
import {
  getProposalRevisions,
  getIsFetchingRevisions,
  getRevisionsError,
} from 'modules/proposals/selectors';
import { Icon } from 'antd';
import './index.less';

interface OwnProps {
  proposalId: Proposal['proposalId'];
}

interface StateProps {
  revisions: ReturnType<typeof getProposalRevisions>;
  isFetchingRevisions: ReturnType<typeof getIsFetchingRevisions>;
  revisionsError: ReturnType<typeof getRevisionsError>;
}

interface DispatchProps {
  fetchProposalRevisions: typeof fetchProposalRevisions;
}

type Props = DispatchProps & OwnProps & StateProps;

export class ProposalRevision extends React.Component<Props> {
  componentDidMount() {
    if (this.props.proposalId) {
      this.props.fetchProposalRevisions(this.props.proposalId);
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.proposalId && nextProps.proposalId !== this.props.proposalId) {
      this.props.fetchProposalRevisions(nextProps.proposalId);
    }
  }

  render() {
    const { revisions, isFetchingRevisions, revisionsError } = this.props;
    let content = null;

    if (isFetchingRevisions) {
      content = <Placeholder loading={true} />;
    } else if (revisionsError) {
      content = <Placeholder title="Something went wrong" subtitle={revisionsError} />;
    } else if (revisions) {
      if (revisions.length) {
        content = revisions.map((revision, index) => (
          <div key={revision.revisionId} className="ProposalRevision-revision">
            <h3 className="ProposalRevision-revision-title">
              {moment(revision.dateCreated * 1000).format('MMMM Do, YYYY')}
            </h3>
            <div className="ProposalRevision-revision-date">
              {`Revision ${revision.revisionIndex + 1}`}
            </div>
            <div className="ProposalRevision-revision-body">
              {this.renderRevisionBody(revision)}
            </div>
            <div className="ProposalRevision-revision-controls">
              {revisions.length !== index + 1 && (
                <Link
                  to={`/proposals/${revision.proposalArchiveId}/archive`}
                  className="ProposalRevision-revision-controls-button"
                >
                  View archived
                </Link>
              )}
            </div>
          </div>
        ));
      } else {
        content = (
          <Placeholder
            title="No revisions have been made"
            subtitle="Edits to this proposal will be tracked here"
          />
        );
      }
    }

    return <div className="ProposalRevision">{content}</div>;
  }

  renderRevisionBody = (revision: Revision) => {
    // TODO: move inline styles to less
    return (
      <div>
        {revision.changes.map((change, index) => (
          <div
            key={`${revision.revisionId}-${index}`}
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexGrow: 1,
              paddingBottom: '0.1rem',
            }}
          >
            <div style={{ opacity: 0.5, paddingRight: '1rem' }}>
              {this.renderChangeIcon(change)}
            </div>
            <div>{this.renderChangeMsg(change)}</div>
          </div>
        ))}
      </div>
    );
  };

  renderChangeIcon = (change: RevisionChange) => {
    if (change.type === 'MILESTONE_ADD') {
      return <Icon type="plus" />;
    }

    if (change.type === 'MILESTONE_REMOVE') {
      return <Icon type="minus" />;
    }

    return <Icon type="edit" />;
  };

  renderChangeMsg = (change: RevisionChange) => {
    const msMsg =
      change.milestoneIndex !== undefined
        ? `Milestone ${change.milestoneIndex + 1}`
        : 'Milestone';

    switch (change.type) {
      case REVISION_CHANGE_TYPES.PROPOSAL_EDIT_BRIEF:
        return 'Proposal brief edited';
      case REVISION_CHANGE_TYPES.PROPOSAL_EDIT_CONTENT:
        return 'Proposal content edited';
      case REVISION_CHANGE_TYPES.PROPOSAL_EDIT_TARGET:
        return 'Proposal target edited';
      case REVISION_CHANGE_TYPES.PROPOSAL_EDIT_TITLE:
        return 'Proposal title edited';
      case REVISION_CHANGE_TYPES.MILESTONE_ADD:
        return `${msMsg} added`;
      case REVISION_CHANGE_TYPES.MILESTONE_REMOVE:
        return `${msMsg} removed`;
      case REVISION_CHANGE_TYPES.MILESTONE_EDIT_AMOUNT:
        return `${msMsg} amount edited`;
      case REVISION_CHANGE_TYPES.MILESTONE_EDIT_DAYS:
        return `${msMsg} estimated days edited`;
      case REVISION_CHANGE_TYPES.MILESTONE_EDIT_IMMEDIATE_PAYOUT:
        return `${msMsg} immediate payout edited`;
      case REVISION_CHANGE_TYPES.MILESTONE_EDIT_PERCENT:
        return `${msMsg} payout percent edited`;
      case REVISION_CHANGE_TYPES.MILESTONE_EDIT_CONTENT:
        return `${msMsg} content edited`;
      case REVISION_CHANGE_TYPES.MILESTONE_EDIT_TITLE:
        return `${msMsg} title edited`;
      default:
        return '';
    }
  };
}

export default connect(
  (state: AppState, ownProps: OwnProps) => ({
    revisions: getProposalRevisions(state, ownProps.proposalId),
    isFetchingRevisions: getIsFetchingRevisions(state),
    revisionsError: getRevisionsError(state),
  }),
  {
    fetchProposalRevisions,
  },
)(ProposalRevision);
