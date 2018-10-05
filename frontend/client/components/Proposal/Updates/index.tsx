import React from 'react';
import { connect } from 'react-redux';
import { Spin } from 'antd';
import Markdown from 'components/Markdown';
import moment from 'moment';
import { AppState } from 'store/reducers';
import { ProposalWithCrowdFund } from 'types';
import { fetchProposalUpdates } from 'modules/proposals/actions';
import {
  getProposalUpdates,
  getIsFetchingUpdates,
  getUpdatesError,
} from 'modules/proposals/selectors';
import './style.less';

interface OwnProps {
  proposalId: ProposalWithCrowdFund['proposalId'];
}

interface StateProps {
  updates: ReturnType<typeof getProposalUpdates>;
  isFetchingUpdates: ReturnType<typeof getIsFetchingUpdates>;
  updatesError: ReturnType<typeof getUpdatesError>;
}

interface DispatchProps {
  fetchProposalUpdates: typeof fetchProposalUpdates;
}

type Props = DispatchProps & OwnProps & StateProps;

class ProposalUpdates extends React.Component<Props> {
  componentDidMount() {
    if (this.props.proposalId) {
      this.props.fetchProposalUpdates(this.props.proposalId);
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.proposalId && nextProps.proposalId !== this.props.proposalId) {
      this.props.fetchProposalUpdates(nextProps.proposalId);
    }
  }

  render() {
    const { updates, isFetchingUpdates, updatesError } = this.props;
    let content = null;

    if (isFetchingUpdates) {
      content = <Spin />;
    } else if (updatesError) {
      content = (
        <>
          <h2>Something went wrong</h2>
          <p>{updatesError}</p>
        </>
      );
    } else if (updates) {
      if (updates.length) {
        content = updates.map(update => (
          <div className="ProposalUpdates-update">
            <h3 className="ProposalUpdates-update-title">{update.title}</h3>
            <div className="ProposalUpdates-update-date">
              {moment(update.dateCreated * 1000).format('MMMM Do, YYYY')}
            </div>
            <div className="ProposalUpdates-update-body">
              <Markdown source={this.truncate(update.body)} />
            </div>
            <div className="ProposalUpdates-update-controls">
              <a className="ProposalUpdates-update-controls-button">Read more</a>
              <a className="ProposalUpdates-update-controls-button">
                {update.totalComments} comments
              </a>
            </div>
          </div>
        ));
      } else {
        content = (
          <h3 className="ProposalUpdates-noUpdates">No updates have been posted yet</h3>
        );
      }
    }

    return <div className="ProposalUpdates">{content}</div>;
  }

  private truncate(text: string) {
    if (text.length < 250) {
      return text;
    }
    return `${text.substr(0, 250)}...`;
  }
}

export default connect(
  (state: AppState, ownProps: OwnProps) => ({
    updates: getProposalUpdates(state, ownProps.proposalId),
    isFetchingUpdates: getIsFetchingUpdates(state),
    updatesError: getUpdatesError(state),
  }),
  {
    fetchProposalUpdates,
  },
)(ProposalUpdates);
