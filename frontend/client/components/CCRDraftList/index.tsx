import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Divider, List, message, Popconfirm, Spin } from 'antd';
import Placeholder from 'components/Placeholder';
import { getIsVerified } from 'modules/auth/selectors';
import Loader from 'components/Loader';
import { CCRDraft, CCRSTATUS } from 'types';
import {
  createCCRDraft,
  deleteCCRDraft,
  fetchAndCreateCCRDrafts,
} from 'modules/ccr/actions';
import { AppState } from 'store/reducers';
import './style.less';

interface StateProps {
  drafts: AppState['ccr']['drafts'];
  isFetchingDrafts: AppState['ccr']['isFetchingDrafts'];
  fetchDraftsError: AppState['ccr']['fetchDraftsError'];
  isCreatingDraft: AppState['ccr']['isCreatingDraft'];
  createDraftError: AppState['ccr']['createDraftError'];
  isDeletingDraft: AppState['ccr']['isDeletingDraft'];
  deleteDraftError: AppState['ccr']['deleteDraftError'];
  isVerified: ReturnType<typeof getIsVerified>;
}

interface DispatchProps {
  createCCRDraft: typeof createCCRDraft;
  deleteCCRDraft: typeof deleteCCRDraft;
  fetchAndCreateCCRDrafts: typeof fetchAndCreateCCRDrafts;
}

interface OwnProps {
  createIfNone?: boolean;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  deletingId: number | null;
}

class CCRDraftList extends React.Component<Props, State> {
  state: State = {
    deletingId: null,
  };

  componentDidMount() {
    this.props.fetchAndCreateCCRDrafts();
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
        <div className="CreateRequestDraftList">
          <Placeholder
            title="Your email is not verified"
            subtitle="Please confirm your email before creating a request."
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
          renderItem={(d: CCRDraft) => {
            const actions = [
              <Link key="edit" to={`/ccrs/${d.ccrId}/edit`}>
                Edit
              </Link>,
              <Popconfirm
                key="delete"
                title="Are you sure?"
                onConfirm={() => this.deleteDraft(d.ccrId)}
              >
                <a>Delete</a>
              </Popconfirm>,
            ];
            return (
              <Spin tip="deleting..." spinning={deletingId === d.ccrId}>
                <List.Item actions={actions}>
                  <List.Item.Meta
                    title={
                      <>
                        {d.title || <em>Untitled Request</em>}
                        {d.status === CCRSTATUS.REJECTED && <em> (rejected)</em>}
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
      <div className="CreateRequestDraftList">
        <h2 className="CreateRequestDraftList-title">Your Request Drafts</h2>
        {draftsEl}
        <Divider>or</Divider>
        <Button
          className="CreateRequestDraftList-create"
          type="primary"
          size="large"
          block
          onClick={() => this.createDraft()}
          loading={isCreatingDraft}
        >
          Create a new Request
        </Button>
      </div>
    );
  }

  private createDraft = () => {
    this.props.createCCRDraft();
  };

  private deleteDraft = (ccrId: number) => {
    this.props.deleteCCRDraft(ccrId);
    this.setState({ deletingId: ccrId });
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    drafts: state.ccr.drafts,
    isFetchingDrafts: state.ccr.isFetchingDrafts,
    fetchDraftsError: state.ccr.fetchDraftsError,
    isCreatingDraft: state.ccr.isCreatingDraft,
    createDraftError: state.ccr.createDraftError,
    isDeletingDraft: state.ccr.isDeletingDraft,
    deleteDraftError: state.ccr.deleteDraftError,
    isVerified: getIsVerified(state),
  }),
  {
    createCCRDraft,
    deleteCCRDraft,
    fetchAndCreateCCRDrafts,
  },
)(CCRDraftList);
