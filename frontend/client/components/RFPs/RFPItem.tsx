import React from 'react';
import moment from 'moment';
import classnames from 'classnames';
import { Tag } from 'antd';
import { Link } from 'react-router-dom';
import UnitDisplay from 'components/UnitDisplay';
import { RFP } from 'types';
import { formatUsd } from 'utils/formatters';
import './RFPItem.less';

interface Props {
  rfp: RFP;
  isSmall?: boolean;
}

export default class RFPItem extends React.Component<Props> {
  render() {
    const { rfp, isSmall } = this.props;
    const {
      urlId,
      title,
      brief,
      acceptedProposals,
      dateOpened,
      dateCloses,
      dateClosed,
      bounty,
      matching,
      isVersionTwo,
      ccr,
    } = rfp;
    const closeDate = dateCloses || dateClosed;

    const tags = [];
    if (!isSmall) {
      if (bounty) {
        if (isVersionTwo) {
          tags.push(
            <Tag key="bounty" color="#CF8A00">
              {formatUsd(bounty.toString(10))} bounty
            </Tag>,
          );
        } else {
          tags.push(
            <Tag key="bounty" color="#CF8A00">
              <UnitDisplay value={bounty} symbol="ZEC" /> bounty
            </Tag>,
          );
        }
      }
      if (matching) {
        tags.push(
          <Tag key="matching" color="#1890ff">
            x2 matching
          </Tag>,
        );
      }
      if (ccr) {
        tags.push(
          <Tag key="matching" color="#52c41a">
            Community Created Request
          </Tag>,
        );
      }
    }

    return (
      <Link
        className={classnames('RFPItem', isSmall && 'is-small')}
        to={`/requests/${urlId}`}
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
          {ccr && (
            <div className="RFPItem-details-detail">
              Submitted by {ccr.author.displayName}
            </div>
          )}
        </div>
      </Link>
    );
  }
}
