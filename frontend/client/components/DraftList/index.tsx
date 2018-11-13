import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { List, Button, Divider, Spin, Alert } from 'antd';
import { ProposalDraft } from 'types';
import { fetchDrafts, createDraft } from 'modules/create/actions';
import { AppState } from 'store/reducers';
import './style.less';

interface StateProps {
  drafts: AppState['create']['drafts'];
  isFetchingDrafts: AppState['create']['isFetchingDrafts'];
  fetchDraftsError: AppState['create']['fetchDraftsError'];
  isCreatingDraft: AppState['create']['isCreatingDraft'];
  createDraftError: AppState['create']['createDraftError'];
}

interface DispatchProps {
  fetchDrafts: typeof fetchDrafts;
  createDraft: typeof createDraft;
}

interface OwnProps {
  createIfNone?: boolean;
}

type Props = StateProps & DispatchProps & OwnProps;

class DraftList extends React.Component<Props> {
  componentWillMount() {
    this.props.fetchDrafts();
  }

  componentDidUpdate(prevProps: Props) {
    const { drafts, createIfNone } = this.props;
    if (createIfNone && drafts && !prevProps.drafts && !drafts.length) {
      this.createDraft();
    }
  }

  render() {
    const { drafts, isCreatingDraft, createDraftError } = this.props;

    if (!drafts) {
      return <Spin />;
    }

    return (
      <div className="DraftList">
        <h2 className="DraftList-title">Your drafts</h2>
        <List
          itemLayout="horizontal"
          dataSource={drafts}
          renderItem={(d: ProposalDraft) => {
            const actions = [
              <Link key="edit" to={`/proposals/${d.proposalId}/edit`}>
                Edit
              </Link>,
              <a key="delete">Delete</a>,
            ];
            return (
              <List.Item actions={actions}>
                <List.Item.Meta
                  title={d.title || <em>Untitled proposal</em>}
                  description={d.brief || <em>No description</em>}
                />
              </List.Item>
            );
          }}
        />
        <Divider>or</Divider>
        {createDraftError && (
          <Alert
            type="error"
            message="Failed to create proposal"
            description={createDraftError}
            showIcon
            closable
          />
        )}
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
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    drafts: state.create.drafts,
    isFetchingDrafts: state.create.isFetchingDrafts,
    fetchDraftsError: state.create.fetchDraftsError,
    isCreatingDraft: state.create.isCreatingDraft,
    createDraftError: state.create.createDraftError,
  }),
  {
    fetchDrafts,
    createDraft,
  },
)(DraftList);
