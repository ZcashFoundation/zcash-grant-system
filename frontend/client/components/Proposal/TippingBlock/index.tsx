import React from 'react';
import { Tooltip, Icon } from 'antd';
import { Proposal } from 'types';
import Loader from 'components/Loader';
import { TipJarBlock } from 'components/TipJar';
import { PROPOSAL_STAGE } from 'api/constants';
import './style.less';

interface Props {
  proposal: Proposal;
}

const TippingBlock: React.SFC<Props> = ({ proposal }) => {
  let content;
  if (proposal) {
    if (!proposal.tipJarAddress || proposal.stage === PROPOSAL_STAGE.CANCELED) {
      return null;
    }
    content = (
      <>
        <div className="TippingBlock-info">
          <div className="TippingBlock-info-label">Tips Received</div>
          <div className="TippingBlock-info-value">
            ??? &nbsp;
            <Tooltip
              placement="left"
              title="Made possible if a proposal owner supplies a view key with their tip address."
            >
              <Icon type="info-circle" />
            </Tooltip>
          </div>
        </div>
        <div className="TippingBlock-tipJarWrapper">
          <TipJarBlock address={proposal.tipJarAddress} type="proposal" />
        </div>
      </>
    );
  } else {
    content = <Loader />;
  }

  return (
    <div className="Proposal-top-side-block">
      <h2 className="Proposal-top-main-block-title">Tipping</h2>
      <div className="Proposal-top-main-block">{content}</div>
    </div>
  );
};

export default TippingBlock;
