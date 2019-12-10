import React from 'react';
import moment from 'moment';
import classnames from 'classnames';
import './index.less';
import { Link } from 'react-router-dom';
import { Proposal } from 'types';
import Like from 'components/Like';

interface CardInfoProps {
  proposal: Proposal;
  time: number;
}

export const CardInfo: React.SFC<CardInfoProps> = ({ proposal, time }) => (
  <div className="Card-info">
    <div className="ProposalCard-info-category">
      <Like proposal={proposal} proposal_card />
    </div>
    <div className="ProposalCard-info-created">{moment(time).fromNow()}</div>
  </div>
);

interface CardProps {
  to: string;
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export class Card extends React.Component<CardProps> {
  public static Info = CardInfo;

  render() {
    const { to, title, children, className } = this.props;
    return (
      <Link to={to}>
        <div className={classnames('Card', className)}>
          <h3 className="Card-title">{title}</h3>
          {children}
        </div>
      </Link>
    );
  }
}

export default Card;
