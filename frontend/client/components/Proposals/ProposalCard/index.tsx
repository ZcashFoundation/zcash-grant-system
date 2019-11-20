import React from 'react';
import { Redirect } from 'react-router-dom';
import { Proposal } from 'types';
import Card from 'components/Card';
import UserAvatar from 'components/UserAvatar';
import UnitDisplay from 'components/UnitDisplay';
import './style.less';

export class ProposalCard extends React.Component<Proposal> {
  state = { redirect: '' };
  render() {
    if (this.state.redirect) {
      return <Redirect push to={this.state.redirect} />;
    }
    const {
      title,
      proposalAddress,
      proposalUrlId,
      datePublished,
      dateCreated,
      team,
      target,
      contributionMatching,
    } = this.props;

    return (
      <Card className="ProposalCard" to={`/proposals/${proposalUrlId}`} title={title}>
        {contributionMatching > 0 && (
          <div className="ProposalCard-ribbon">
            <span>
              x2
              <small>matching</small>
            </span>
          </div>
        )}
        <div className="ProposalCard-funding">
          <div className="ProposalCard-funding-raised">
            <UnitDisplay value={target} symbol="ZEC" />
          </div>
        </div>

        <div className="ProposalCard-team">
          <div className="ProposalCard-team-name">
            {team[0].displayName}{' '}
            {team.length > 1 && <small>+{team.length - 1} other</small>}
          </div>
          <div className="ProposalCard-team-avatars">
            {[...team].reverse().map((u, idx) => (
              <UserAvatar
                key={idx}
                className="ProposalCard-team-avatars-avatar"
                user={u}
              />
            ))}
          </div>
        </div>
        <div className="ProposalCard-address">{proposalAddress}</div>
        <Card.Info proposal={this.props} time={(datePublished || dateCreated) * 1000} />
      </Card>
    );
  }
}

export default ProposalCard;
