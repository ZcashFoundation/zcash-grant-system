import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { List, Button, Divider, Spin, Popconfirm, message } from 'antd';
import Placeholder from 'components/Placeholder';
import { ProposalDraft } from 'types';
import { fetchDrafts, createDraft, deleteDraft } from 'modules/create/actions';
import { AppState } from 'store/reducers';
import './style.less';

interface StateProps {
  drafts: AppState['create']['drafts'];
  isFetchingDrafts: AppState['create']['isFetchingDrafts'];
  fetchDraftsError: AppState['create']['fetchDraftsError'];
  isCreatingDraft: AppState['create']['isCreatingDraft'];
  createDraftError: AppState['create']['createDraftError'];
  isDeletingDraft: AppState['create']['isDeletingDraft'];
  deleteDraftError: AppState['create']['deleteDraftError'];
}

interface DispatchProps {
  fetchDrafts: typeof fetchDrafts;
  createDraft: typeof createDraft;
  deleteDraft: typeof deleteDraft;
}

interface OwnProps {
  createIfNone?: boolean;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  deletingId: number | null;
}

class DraftList extends React.Component<Props, State> {
  state: State = {
    deletingId: null,
  };

  componentWillMount() {
    this.props.fetchDrafts();
  }

  componentDidUpdate(prevProps: Props) {
    const {
      drafts,
      createIfNone,
      isDeletingDraft,
      deleteDraftError,
      createDraftError,
    } = this.props;
    if (createIfNone && drafts && !prevProps.drafts && !drafts.length) {
      this.createDraft();
    }
    if (prevProps.isDeletingDraft && !isDeletingDraft) {
      this.setState({ deletingId: null });
    }
    if (deleteDraftError && prevProps.deleteDraftError !== deleteDraftError) {
      message.error('Failed to delete draft', 3);
    }
    if (createDraftError && prevProps.createDraftError !== createDraftError) {
      message.error('Failed to create draft', 3);
    }
  }

  render() {
    const { drafts, isCreatingDraft } = this.props;
    const { deletingId } = this.state;

    if (!drafts || isCreatingDraft) {
      return <Spin />;
    }

    let draftsEl;
    if (drafts.length) {
      draftsEl = (
        <List
          itemLayout="horizontal"
          dataSource={drafts}
          renderItem={(d: ProposalDraft) => {
            const actions = [
              <Link key="edit" to={`/proposals/${d.proposalId}/edit`}>
                Edit
              </Link>,
              <Popconfirm
                key="delete"
                title="Are you sure?"
                onConfirm={() => this.deleteDraft(d.proposalId)}
              >
                <a>Delete</a>
              </Popconfirm>,
            ];
            return (
              <Spin tip="deleting..." spinning={deletingId === d.proposalId}>
                <List.Item actions={actions}>
                  <List.Item.Meta
                    title={d.title || <em>Untitled proposal</em>}
                    description={d.brief || <em>No description</em>}
                  />
                </List.Item>
              </Spin>
            );
          }}
        />
      );
    } else {
      draftsEl = (
        <Placeholder
          title="You have no drafts"
          subtitle="Why not make one now? Click below to start."
        />
      );
    }

    return (
      <div className="DraftList">
        <h2 className="DraftList-title">Your drafts</h2>
        {draftsEl}
        <Divider>or</Divider>
        <Button
          className="DraftList-create"
          type="primary"
          size="large"
          block
          onClick={this.createDraft}
          loading={isCreatingDraft}
        >
          Create a new Proposal
        </Button>
      </div>
    );
  }

  private createDraft = () => {
    this.props.createDraft({ redirect: true });
  };

  private deleteDraft = (proposalId: number) => {
    this.props.deleteDraft(proposalId);
    this.setState({ deletingId: proposalId });
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    drafts: state.create.drafts,
    isFetchingDrafts: state.create.isFetchingDrafts,
    fetchDraftsError: state.create.fetchDraftsError,
    isCreatingDraft: state.create.isCreatingDraft,
    createDraftError: state.create.createDraftError,
    isDeletingDraft: state.create.isDeletingDraft,
    deleteDraftError: state.create.deleteDraftError,
  }),
  {
    fetchDrafts,
    createDraft,
    deleteDraft,
  },
)(DraftList);
