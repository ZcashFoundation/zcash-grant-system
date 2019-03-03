import React from 'react';
import moment from 'moment';
import classnames from 'classnames';
import { Tag } from 'antd';
import { Link } from 'react-router-dom';
import UnitDisplay from 'components/UnitDisplay';
import { RFP } from 'types';
import './RFPItem.less';
import BN from 'bn.js';

interface Props {
  rfp: RFP;
  isSmall?: boolean;
}

export default class RFPItem extends React.Component<Props> {
  render() {
    const { rfp, isSmall } = this.props;
    const {
      id,
      title,
      brief,
      acceptedProposals,
      dateOpened,
      dateCloses,
      dateClosed,
      bounty,
      matching,
    } = rfp;
    const closeDate = dateCloses || dateClosed;

    const tags = [];
    if (!isSmall) {
      if (bounty && bounty.gt(new BN(0))) {
        tags.push(
          <Tag key="bounty" color="#CF8A00">
            <UnitDisplay value={bounty} symbol="ZEC" /> bounty
          </Tag>,
        );
      }
      if (matching) {
        tags.push(
          <Tag key="matching" color="#1890ff">
            x2 matching
          </Tag>,
        );
      }
    }

    return (
      <Link
        className={classnames('RFPItem', isSmall && 'is-small')}
        to={`/requests/${id}`}
      >
        <h3 className="RFPItem-title">
          {title}
          {tags}
        </h3>
        <p className="RFPItem-brief">{brief}</p>

        <div className="RFPItem-details">
          <div className="RFPItem-details-detail">
            {moment(dateOpened * 1000).format('LL')}
            {closeDate && <> – {moment(closeDate * 1000).format('LL')}</>}
          </div>
          <div className="RFPItem-details-detail">
            {acceptedProposals.length} proposals approved
          </div>
        </div>
      </Link>
    );
  }
}
