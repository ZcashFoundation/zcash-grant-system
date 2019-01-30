import React from 'react';
import moment from 'moment';
import classnames from 'classnames';
import { Icon } from 'antd';
import { PROPOSAL_CATEGORY, CATEGORY_UI } from 'api/constants';
import './index.less';
import { Link } from 'react-router-dom';

interface CardInfoProps {
  category: PROPOSAL_CATEGORY;
  time: number;
}

export const CardInfo: React.SFC<CardInfoProps> = ({ category, time }) => (
  <div className="Card-info">
    <div
      className="ProposalCard-info-category"
      style={{ color: CATEGORY_UI[category].color }}
    >
      <Icon type={CATEGORY_UI[category].icon} /> {CATEGORY_UI[category].label}
    </div>
    <div className="ProposalCard-info-created">
      {moment(time).fromNow()}
    </div>
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
    )
  }
}

export default Card;
