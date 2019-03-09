import React from 'react';
import { view } from 'react-easy-state';
import { Tag, Tooltip, List } from 'antd';
import { Link } from 'react-router-dom';
import { Proposal, PROPOSAL_STATUS } from 'src/types';
import { PROPOSAL_STATUSES, PROPOSAL_STAGES, getStatusById } from 'util/statuses';
import { formatDateSeconds } from 'util/time';
import './ProposalItem.less';

class ProposalItemNaked extends React.Component<Proposal> {
  state = {
    showDelete: false,
  };
  render() {
    const p = this.props;
    const status = getStatusById(PROPOSAL_STATUSES, p.status);
    const stage = getStatusById(PROPOSAL_STAGES, p.stage);

    return (
      <List.Item key={p.proposalId} className="ProposalItem">
        <Link to={`/proposals/${p.proposalId}`}>
          <h2>
            {p.title || '(no title)'}
            <Tooltip title={status.hint}>
              <Tag color={status.tagColor}>{status.tagDisplay}</Tag>
            </Tooltip>
            {p.status === PROPOSAL_STATUS.LIVE && (
              <Tooltip title={stage.hint}>
                <Tag color={stage.tagColor}>{stage.tagDisplay}</Tag>
              </Tooltip>
            )}
          </h2>
          <p>Created: {formatDateSeconds(p.dateCreated)}</p>
          <p>{p.brief}</p>
          {p.rfp && (
            <p>
              Submitted for RFP: <strong>{p.rfp.title}</strong>
            </p>
          )}
        </Link>
      </List.Item>
    );
  }
}

const ProposalItem = view(ProposalItemNaked);
export default ProposalItem;
