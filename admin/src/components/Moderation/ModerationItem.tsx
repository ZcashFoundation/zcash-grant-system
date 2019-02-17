import React from 'react';
import { view } from 'react-easy-state';
import { Popconfirm, Tag, Tooltip, List } from 'antd';
import { Link } from 'react-router-dom';
import store from 'src/store';
import { Proposal } from 'src/types';
import { PROPOSAL_STATUSES, getStatusById } from 'util/statuses';
import { formatDateSeconds } from 'util/time';
import './ProposalItem.less';

class ProposalItemNaked extends React.Component<Proposal> {
  state = {
    showDelete: false,
  };
  render() {
    const p = this.props;
    const status = getStatusById(PROPOSAL_STATUSES, p.status);
    const actions = [
      <Popconfirm
        key="delete"
        onConfirm={this.handleDelete}
        title="Are you sure?"
        okText="Delete"
        okType="danger"
        placement="left"
      >
        <a>delete</a>
      </Popconfirm>,
    ];

    return (
      <List.Item key={p.proposalId} className="ProposalItem" actions={actions}>
        <Link to={`/proposals/${p.proposalId}`}>
          <h2>
            {p.title || '(no title)'}
            <Tooltip title={status.hint}>
              <Tag color={status.tagColor}>{status.tagDisplay}</Tag>
            </Tooltip>
          </h2>
          <p>Created: {formatDateSeconds(p.dateCreated)}</p>
          <p>{p.brief}</p>
          {p.rfp && (
            <p>Submitted for RFP: <strong>{p.rfp.title}</strong></p>
          )}
        </Link>
      </List.Item>
    );
  }
  private handleDelete = () => {
    store.deleteProposal(this.props.proposalId);
  };
}

const ProposalItem = view(ProposalItemNaked);
export default ProposalItem;
