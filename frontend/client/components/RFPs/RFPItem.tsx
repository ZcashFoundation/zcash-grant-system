import React from 'react';
import moment from 'moment';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { RFP } from 'types';
import './RFPItem.less';

interface Props {
  rfp: RFP;
  isSmall?: boolean;
}

export default class RFPItem extends React.Component<Props> {
  render() {
    const { rfp, isSmall } = this.props;
    const { id, title, brief, acceptedProposals, dateCreated } = rfp;

    return (
      <Link
        className={classnames('RFPItem', isSmall && 'is-small')}
        to={`/requests/${id}`}
      >
        <h3 className="RFPItem-title">{title}</h3>
        <p className="RFPItem-brief">{brief}</p>

        <div className="RFPItem-details">
          <div className="RFPItem-details-detail">
            {moment(dateCreated * 1000).format('LL')}
          </div>
          <div className="RFPItem-details-detail">
            {acceptedProposals.length} proposals approved
          </div>
        </div>
      </Link>
    );
  }
}
