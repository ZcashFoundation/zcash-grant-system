import React from 'react';
import { connect } from 'react-redux';
import Markdown from 'components/Markdown';
import moment from 'moment';
import Placeholder from 'components/Placeholder';
import FullUpdate from './FullUpdate';
import { AppState } from 'store/reducers';
import { Proposal, Update } from 'types';
import { fetchProposalUpdates } from 'modules/proposals/actions';
import {
  getProposalUpdates,
  getIsFetchingUpdates,
  getUpdatesError,
} from 'modules/proposals/selectors';
import './style.less';

interface OwnProps {
  proposalId: Proposal['proposalId'];
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

interface State {
  activeUpdate: Update | null;
}

class ProposalUpdates extends React.Component<Props, State> {
  state: State = {
    activeUpdate: null,
  };

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
    const { activeUpdate } = this.state;
    let content = null;

    if (isFetchingUpdates) {
      content = <Placeholder loading={true} />;
    } else if (updatesError) {
      content = <Placeholder title="Something went wrong" subtitle={updatesError} />;
    } else if (updates) {
      if (activeUpdate) {
        content = (
          <FullUpdate update={activeUpdate} goBack={() => this.setActiveUpdate(null)} />
        );
      } else if (updates.length) {
        content = updates.map(update => (
          <div
            key={update.updateId}
            className="ProposalUpdates-update"
            onClick={() => this.setActiveUpdate(update)}
          >
            <h3 className="ProposalUpdates-update-title">{update.title}</h3>
            <div className="ProposalUpdates-update-date">
              {moment(update.dateCreated * 1000).format('MMMM Do, YYYY')}
            </div>
            <div className="ProposalUpdates-update-body">
              <Markdown source={this.truncate(update.content)} />
            </div>
            <div className="ProposalUpdates-update-controls">
              <a className="ProposalUpdates-update-controls-button">Read more</a>
            </div>
          </div>
        ));
      } else {
        content = (
          <Placeholder
            title="No updates have been posted"
            subtitle="Check back later to see updates from the team"
          />
        );
      }
    }

    return <div className="ProposalUpdates">{content}</div>;
  }

  private setActiveUpdate = (activeUpdate: Update | null) => {
    this.setState({ activeUpdate });
  };

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
