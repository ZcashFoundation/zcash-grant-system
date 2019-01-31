import React from 'react';
import { Link } from 'react-router-dom';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';
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
        <Link className="RFPBlock-content" to={`/requests/${rfp.id}`}>
          <h3 className="RFPBlock-content-title">{rfp.title}</h3>
          <Ellipsis className="RFPBlock-content-brief" lines={2}>
            {rfp.brief}
          </Ellipsis>
        </Link>
      </div>
    </div>
  );
};

export default RFPBlock;
