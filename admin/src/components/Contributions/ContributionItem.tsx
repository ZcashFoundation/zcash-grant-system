import React from 'react';
import { List, Tag, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { Contribution } from 'src/types';
import { CONTRIBUTION_STATUSES, getStatusById } from 'util/statuses';
import { formatDateSeconds } from 'util/time';
import './ContributionItem.less';

interface Props {
  contribution: Contribution;
}

export default class ContributionItem extends React.PureComponent<Props> {
  render() {
    const { id, amount, dateCreated, proposal, user } = this.props.contribution;
    const status = getStatusById(CONTRIBUTION_STATUSES, this.props.contribution.status);

    return (
      <List.Item
        className="ContributionItem"
        actions={[
          <Link key="edit" to={`/contributions/${id}/edit`}>
            edit
          </Link>,
        ]}
      >
        <Link to={`/contributions/${id}`}>
          <h2>
            {user ? user.displayName : <em>Anonymous</em>} <small>for</small>{' '}
            {proposal.title}
            <Tooltip title={status.hint}>
              <Tag color={status.tagColor}>{status.tagDisplay}</Tag>
            </Tooltip>
          </h2>
          <p>
            <span>
              <strong>Amount:</strong> {amount} ZEC
            </span>
            <span>
              <strong>Created:</strong> {formatDateSeconds(dateCreated)}
            </span>
          </p>
        </Link>
      </List.Item>
    );
  }
}
