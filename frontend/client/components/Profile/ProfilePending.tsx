import React from 'react';
import { Link } from 'react-router-dom';
import { UserProposal } from 'types';
import UserRow from 'components/UserRow';
import UnitDisplay from 'components/UnitDisplay';
import './ProfilePending.less';

interface OwnProps {
  proposal: UserProposal;
}

export default class ProfilePending extends React.Component<OwnProps> {
  render() {
    const {
      status,
      title,
      brief,
      team,
      funded,
      target,
      proposalId,
    } = this.props.proposal;

    return (
      <div className="ProfilePending">
        <div className="ProfilePending-block">
          <Link to={`/proposals/${proposalId}`} className="ProfilePending-title">
            {title} - {status}
          </Link>
          <div className="ProfilePending-brief">{brief}</div>
          <div className="ProfilePending-raised">
            <UnitDisplay value={funded} symbol="ETH" displayShortBalance={4} />{' '}
            <small>raised</small> of{' '}
            <UnitDisplay value={target} symbol="ETH" displayShortBalance={4} /> goal
          </div>
        </div>
        <div className="ProfilePending-block">
          <h3>Team</h3>
          <div className="ProfilePending-block-team">
            {team.map(user => (
              <UserRow key={user.userid} user={user} />
            ))}
          </div>
        </div>
      </div>
    );
  }
}
