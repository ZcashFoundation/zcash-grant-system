import React from 'react';
import { connect } from 'react-redux';
import { Spin } from 'antd';
import Markdown from 'components/Markdown';
import moment from 'moment';
import { AppState } from 'store/reducers';
import { ProposalWithCrowdFund } from 'modules/proposals/reducers';
import { fetchProposalUpdates } from 'modules/proposals/actions';
import {
  getProposalUpdates,
  getIsFetchingUpdates,
  getUpdatesError,
} from 'modules/proposals/selectors';
import * as Styled from './styled';

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
          <Styled.Update>
            <Styled.Title>{update.title}</Styled.Title>
            <Styled.Date>
              {moment(update.dateCreated * 1000).format('MMMM Do, YYYY')}
            </Styled.Date>
            <Styled.BodyPreview>
              <Markdown source={this.truncate(update.body)} />
            </Styled.BodyPreview>
            <Styled.Controls>
              <Styled.ControlButton>Read more</Styled.ControlButton>
              <Styled.ControlButton>{update.totalComments} comments</Styled.ControlButton>
            </Styled.Controls>
          </Styled.Update>
        ));
      } else {
        content = <Styled.NoUpdates>No updates have been posted yet</Styled.NoUpdates>;
      }
    }

    return content;
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
