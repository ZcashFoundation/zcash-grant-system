import React from 'react';
import { connect } from 'react-redux';
import { Icon, Button, Input, message } from 'antd';
import { AppState } from 'store/reducers';
import { proposalActions } from 'modules/proposals';
import { ProposalDetail } from 'modules/proposals/reducers';
import { followProposal } from 'api/api';
import AuthButton from 'components/AuthButton';
import './index.less';

interface OwnProps {
  proposal: ProposalDetail;
}

interface StateProps {
  authUser: AppState['auth']['user'];
}

interface DispatchProps {
  fetchProposal: typeof proposalActions['fetchProposal'];
}

type Props = OwnProps & StateProps & DispatchProps;

const STATE = {
  loading: false,
};
type State = typeof STATE;

class Follow extends React.Component<Props, State> {
  state: State = { ...STATE };
  render() {
    const { authedFollows, followersCount } = this.props.proposal;
    const { loading } = this.state;
    return (
      <Input.Group className="Follow" compact>
        <AuthButton onClick={this.handleFollow}>
          <Icon
            theme={authedFollows ? 'filled' : 'outlined'}
            type={loading ? 'loading' : 'star'}
          />
          <span className="Follow-label">{authedFollows ? ' Unfollow' : ' Follow'}</span>
        </AuthButton>
        <Button className="Follow-count" disabled>
          <span>{followersCount}</span>
        </Button>
      </Input.Group>
    );
  }

  private handleFollow = async () => {
    const { proposalId, authedFollows } = this.props.proposal;
    this.setState({ loading: true });
    try {
      await followProposal(proposalId, !authedFollows);
      await this.props.fetchProposal(proposalId);
      message.success(<>Proposal {authedFollows ? 'unfollowed' : 'followed'}</>);
    } catch (error) {
      // tslint:disable:no-console
      console.error('Follow.handleFollow - unable to change follow state', error);
      message.error('Unable to follow proposal');
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
  },
);

export default withConnect(Follow);
