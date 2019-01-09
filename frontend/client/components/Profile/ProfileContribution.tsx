import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, Icon } from 'antd';
import UnitDisplay from 'components/UnitDisplay';
import { ONE_DAY } from 'utils/time';
import { UserContribution } from 'types';
import './ProfileContribution.less';

interface Props {
  contribution: UserContribution;
}

export default class ProfileContribution extends React.Component<Props> {
  render() {
    const { contribution } = this.props;
    const { proposal } = contribution;
    const isConfirmed = contribution.status === 'CONFIRMED';
    const isExpired = !isConfirmed && contribution.dateCreated < Date.now() - ONE_DAY;

    let tag;
    let actions: React.ReactNode;
    if (isConfirmed) {
      // TODO: Link to block explorer
      actions = <a>View transaction</a>;
    } else if (isExpired) {
      tag = <Tag color="red">Expired</Tag>;
      // TODO: Link to support & implement remove contribution
      actions = <>
        <a>Delete</a>
        <a>Contact support</a>
      </>;
    } else {
      tag = <Tag color="orange">Pending</Tag>;
      // TODO: Show ContributionModal
      actions = <a>View instructions</a>;
    }

    return (
      <div className="ProfileContribution">
        <div className="ProfileContribution-info">
          <Link
            className="ProfileContribution-info-title"
            to={`/proposals/${proposal.proposalId}`}
          >
            {proposal.title} {tag}
          </Link>
          <div className="ProfileContribution-info-brief">{proposal.brief}</div>
        </div>
        <div className="ProfileContribution-state">
          <div className="ProfileContribution-state-amount">
            +<UnitDisplay value={contribution.amount} symbol="ZEC" />
          </div>
          <div className="ProfileContribution-state-actions">
            {actions}
          </div>
        </div>
      </div>
    );
  }
}
