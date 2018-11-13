import React from 'react';
import { connect } from 'react-redux';
import { Spin } from 'antd';
import { fetchDrafts, createDraft } from 'modules/create/actions';
import { AppState } from 'store/reducers';

interface StateProps {
  drafts: AppState['create']['drafts'];
  isFetchingDrafts: AppState['create']['isFetchingDrafts'];
  fetchDraftsError: AppState['create']['fetchDraftsError'];
}

interface DispatchProps {
  fetchDrafts: typeof fetchDrafts;
  createDraft: typeof createDraft;
}

type Props = StateProps & DispatchProps;

class Create extends React.Component<Props> {
  componentWillMount() {
    this.props.fetchDrafts();
  }

  componentDidUpdate(prevProps: Props) {
    const { drafts } = this.props;
    if (drafts && !prevProps.drafts && !drafts.length) {
      this.props.createDraft({ redirect: true });
    }
  }

  render() {
    const { drafts, fetchDraftsError } = this.props;

    if (drafts && drafts.length) {
      return <pre>{JSON.stringify(drafts, null, 2)}</pre>;
    } else if (fetchDraftsError) {
      return <h1>{fetchDraftsError}</h1>;
    } else {
      return <Spin />;
    }
  }
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    drafts: state.create.drafts,
    isFetchingDrafts: state.create.isFetchingDrafts,
    fetchDraftsError: state.create.fetchDraftsError,
  }),
  {
    fetchDrafts,
    createDraft,
  },
)(Create);
