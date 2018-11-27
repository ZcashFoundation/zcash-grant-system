import React from 'react';
import classnames from 'classnames';
import { Progress, Icon } from 'antd';
import moment from 'moment';
import { Redirect } from 'react-router-dom';
import { CATEGORY_UI } from 'api/constants';
import { ProposalWithCrowdFund } from 'types';
import UserAvatar from 'components/UserAvatar';
import UnitDisplay from 'components/UnitDisplay';
import './style.less';

export class ProposalCard extends React.Component<ProposalWithCrowdFund> {
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
      crowdFund,
      team,
    } = this.props;

    return (
      <div
        className="ProposalCard"
        onClick={() => this.setState({ redirect: `/proposals/${proposalUrlId}` })}
      >
        <h3 className="ProposalCard-title">{title}</h3>
        <div className="ProposalCard-funding">
          <div className="ProposalCard-funding-raised">
            <UnitDisplay value={crowdFund.funded} symbol="ETH" /> <small>raised</small> of{' '}
            <UnitDisplay value={crowdFund.target} symbol="ETH" /> goal
          </div>
          <div
            className={classnames({
              ['ProposalCard-funding-percent']: true,
              ['is-funded']: crowdFund.percentFunded >= 100,
            })}
          >
            {crowdFund.percentFunded}%
          </div>
        </div>
        <Progress
          percent={crowdFund.percentFunded}
          status={crowdFund.percentFunded >= 100 ? 'success' : 'active'}
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

        <div className="ProposalCard-info">
          <div
            className="ProposalCard-info-category"
            style={{ color: CATEGORY_UI[category].color }}
          >
            <Icon type={CATEGORY_UI[category].icon} /> {CATEGORY_UI[category].label}
          </div>
          <div className="ProposalCard-info-created">
            {moment(dateCreated * 1000).fromNow()}
          </div>
        </div>
      </div>
    );
  }
}

export default ProposalCard;
