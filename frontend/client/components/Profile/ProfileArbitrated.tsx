import React from 'react';
import { Link } from 'react-router-dom';
import { UserProposal } from 'types';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import './ProfileArbitrated.less';

interface OwnProps {
  proposal: UserProposal;
}

interface StateProps {
  user: AppState['auth']['user'];
}

type Props = OwnProps & StateProps;

class ProfileArbitrated extends React.Component<Props, {}> {
  render() {
    const { title, proposalId } = this.props.proposal;

    return (
      <div className="ProfileArbitrated">
        <div className="ProfileArbitrated-block">
          <Link to={`/proposals/${proposalId}`} className="ProfileArbitrated-title">
            {title}
          </Link>
          <div className={`ProfileArbitrated-info`}>
            You are the arbiter for this proposal. You are responsible for reviewing
            milestone payout requests.
          </div>
        </div>
        <div className="ProfileArbitrated-block is-actions">
          {/* TODO - review milestone button & etc. */}
        </div>
      </div>
    );
  }
}

export default connect<StateProps, {}, OwnProps, AppState>(state => ({
  user: state.auth.user,
}))(ProfileArbitrated);
