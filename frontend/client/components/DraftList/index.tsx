import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Divider, List, message, Popconfirm, Spin } from 'antd';
import Placeholder from 'components/Placeholder';
import { getIsVerified } from 'modules/auth/selectors';
import Loader from 'components/Loader';
import { ProposalDraft, STATUS } from 'types';
import {
  createDraft,
  deleteDraft,
  fetchDrafts,
  fetchAndCreateDrafts,
} from 'modules/create/actions';
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
  isVerified: ReturnType<typeof getIsVerified>;
}

interface DispatchProps {
  fetchDrafts: typeof fetchDrafts;
  createDraft: typeof createDraft;
  deleteDraft: typeof deleteDraft;
  fetchAndCreateDrafts: typeof fetchAndCreateDrafts;
}

interface OwnProps {
  createIfNone?: boolean;
  createWithRfpId?: number;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  deletingId: number | null;
}

const EMAIL_VERIFIED_RELOAD_TIMEOUT = 10000;

class DraftList extends React.Component<Props, State> {
  state: State = {
    deletingId: null,
  };

  private reloadTimeout: number | null = null;

  componentDidMount() {
    const { createIfNone, createWithRfpId, isVerified } = this.props;
    if (createIfNone || createWithRfpId) {
      this.props.fetchAndCreateDrafts({
        rfpId: createWithRfpId,
        redirect: true,
      });
    } else {
      this.props.fetchDrafts();
    }

    if (!isVerified) {
      this.reloadTimeout = window.setTimeout(() => {
        window.location.reload();
      }, EMAIL_VERIFIED_RELOAD_TIMEOUT);
    }
  }

  componentWillUnmount() {
    if (this.reloadTimeout !== null) {
      window.clearTimeout(this.reloadTimeout);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { isDeletingDraft, deleteDraftError, createDraftError } = this.props;
    if (prevProps.isDeletingDraft && !isDeletingDraft) {
      this.setState({ deletingId: null });
    }
    if (deleteDraftError && prevProps.deleteDraftError !== deleteDraftError) {
      message.error(deleteDraftError, 3);
    }
    if (createDraftError && prevProps.createDraftError !== createDraftError) {
      message.error(createDraftError, 3);
    }
  }

  render() {
    const { drafts, isCreatingDraft, isFetchingDrafts, isVerified } = this.props;
    const { deletingId } = this.state;

    if (!isVerified) {
      return (
        <div className="DraftList">
          <Placeholder
            title="Your email is not verified"
            subtitle="Please confirm your email before making a proposal."
          />
        </div>
      );
    }

    if (!drafts || isCreatingDraft) {
      return <Loader size="large" />;
    }

    let draftsEl;
    if (drafts.length) {
      draftsEl = (
        <List
          itemLayout="horizontal"
          dataSource={drafts}
          loading={isFetchingDrafts}
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
                    title={
                      <>
                        {d.title || <em>Untitled Proposal</em>}
                        {d.status === STATUS.REJECTED && <em> (changes requested)</em>}
                      </>
                    }
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
        <h2 className="DraftList-title">Your Proposal Drafts</h2>
        {draftsEl}
        <Divider>or</Divider>
        <Button
          className="DraftList-create"
          type="primary"
          size="large"
          block
          onClick={() => this.createDraft()}
          loading={isCreatingDraft}
        >
          Create a new Proposal
        </Button>
      </div>
    );
  }

  private createDraft = (rfpId?: number) => {
    this.props.createDraft({ rfpId, redirect: true });
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
    isVerified: getIsVerified(state),
  }),
  {
    fetchDrafts,
    createDraft,
    deleteDraft,
    fetchAndCreateDrafts,
  },
)(DraftList);
