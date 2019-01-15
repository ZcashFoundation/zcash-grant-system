import React from 'react';
import { view } from 'react-easy-state';
import { Popconfirm, Tag, Tooltip, List } from 'antd';
import { Link } from 'react-router-dom';
import store from 'src/store';
import { Proposal } from 'src/types';
import { getStatusById } from './STATUSES';
import { formatDateSeconds } from 'src/util/time';
import './ProposalItem.less';

class ProposalItemNaked extends React.Component<Proposal> {
  state = {
    showDelete: false,
  };
  render() {
    const p = this.props;
    const status = getStatusById(p.status);

    const deleteAction = (
      <Popconfirm
        onConfirm={this.handleDelete}
        title="Are you sure?"
        okText="delete"
        cancelText="cancel"
      >
        <div>delete</div>
      </Popconfirm>
    );
    const viewAction = <Link to={`/proposals/${p.proposalId}`}>view</Link>;
    const actions = [viewAction, deleteAction];

    return (
      <List.Item key={p.proposalId} className="ProposalItem" actions={actions}>
        <div>
          <h1>
            {p.title || '(no title)'}{' '}
            <Tooltip title={status.hint}>
              <Tag color={status.tagColor}>{status.tagDisplay}</Tag>
            </Tooltip>
          </h1>
          <div>Created: {formatDateSeconds(p.dateCreated)}</div>
          <div>{p.brief}</div>
        </div>
      </List.Item>
    );
  }
  private handleDelete = () => {
    store.deleteProposal(this.props.proposalId);
  };
}

const ProposalItem = view(ProposalItemNaked);
export default ProposalItem;
