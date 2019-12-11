import React from 'react';
import { Link } from 'react-router-dom';
import { UserProposal } from 'types';
import './ProfileProposal.less';
import UserRow from 'components/UserRow';
import UnitDisplay from 'components/UnitDisplay';
import { Tag } from 'antd';
import { formatUsd } from 'utils/formatters'

interface OwnProps {
  proposal: UserProposal;
}

export default class Profile extends React.Component<OwnProps> {
  render() {
    const {
      title,
      brief,
      team,
      proposalId,
      funded,
      target,
      isVersionTwo,
      acceptedWithFunding,
    } = this.props.proposal;

    // pulled from `variables.less`
    const infoColor = '#1890ff'
    const secondaryColor = '#2D2A26'

    const tagColor = acceptedWithFunding
      ? secondaryColor
      : infoColor
    const tagMessage = acceptedWithFunding 
      ? 'Funded by ZF'
      : 'Open for Contributions'

    return (
      <div className="ProfileProposal">
        <div className="ProfileProposal-block">
          <Link to={`/proposals/${proposalId}`} className="ProfileProposal-title">
            {title} {isVersionTwo && (<Tag color={tagColor} style={{verticalAlign: 'text-top'}}>{tagMessage}</Tag>)}
          </Link>
          <div className="ProfileProposal-brief">{brief}</div>
          {!isVersionTwo && (
            <div className="ProfileProposal-raised">
              <UnitDisplay value={funded} symbol="ZEC" displayShortBalance={4} />{' '}
              <small>raised</small> of{' '}
              <UnitDisplay value={target} symbol="ZEC" displayShortBalance={4} /> goal
            </div>
          )}
          {isVersionTwo && (
            <div className="ProfileProposal-raised">
              {formatUsd(target.toString())}
            </div>
          )}
        </div>
        <div className="ProfileProposal-block">
          <h3>Team</h3>
          <div className="ProfileProposal-block-team">
            {team.map(user => (
              <UserRow key={user.userid} user={user} />
            ))}
          </div>
        </div>
      </div>
    );
  }
}
