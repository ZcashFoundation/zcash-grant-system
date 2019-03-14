import React from 'react';
import { Link } from 'react-router-dom';
import { RFP } from 'types';
import './index.less';

interface Props {
  rfp: RFP;
}

const RFPBlock: React.SFC<Props> = ({ rfp }) => {
  return (
    <div className="RFPBlock Proposal-top-side-block">
      <h2 className="Proposal-top-main-block-title">Request</h2>
      <div className="Proposal-top-main-block">
        <Link className="RFPBlock-content" to={`/requests/${rfp.urlId}`}>
          <h3 className="RFPBlock-content-title">{rfp.title}</h3>
          <div className="RFPBlock-content-brief">{rfp.brief}</div>
        </Link>
      </div>
    </div>
  );
};

export default RFPBlock;
