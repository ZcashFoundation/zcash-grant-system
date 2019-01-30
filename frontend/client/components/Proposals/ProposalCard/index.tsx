import React from 'react';
import classnames from 'classnames';
import { Progress } from 'antd';
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
      category,
      dateCreated,
      team,
      target,
      funded,
      contributionMatching,
      percentFunded,
    } = this.props;

    return (
      <Card
        className="ProposalCard"
        to={`/proposals/${proposalUrlId}`}
        title={title}
      >
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
            <UnitDisplay value={funded} symbol="ZEC" /> <small>raised</small> of{' '}
            <UnitDisplay value={target} symbol="ZEC" /> goal
          </div>
          <div
            className={classnames({
              ['ProposalCard-funding-percent']: true,
              ['is-funded']: percentFunded >= 100,
            })}
          >
            {percentFunded}%
          </div>
        </div>
        <Progress
          percent={percentFunded}
          status={percentFunded >= 100 ? 'success' : 'active'}
          showInfo={false}
        />

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
        <Card.Info category={category} time={dateCreated * 1000} />
      </Card>
    );
  }
}

export default ProposalCard;
