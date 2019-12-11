import React from 'react';
import { view } from 'react-easy-state';
import { Tag, Tooltip, List } from 'antd';
import { Link } from 'react-router-dom';
import { CCR } from 'src/types';
import { CCR_STATUSES, getStatusById } from 'util/statuses';
import { formatDateSeconds } from 'util/time';
import './CCRItem.less';

class CCRItemNaked extends React.Component<CCR> {
  render() {
    const props = this.props;
    const status = getStatusById(CCR_STATUSES, props.status);

    return (
      <List.Item key={props.ccrId} className="CCRItem">
        <Link to={`/ccrs/${props.ccrId}`}>
          <h2>
            {props.title || '(no title)'}
            <Tooltip title={status.hint}>
              <Tag color={status.tagColor}>
                {status.tagDisplay === 'Live'
                  ? 'Accepted/Generated RFP'
                  : status.tagDisplay}
              </Tag>
            </Tooltip>
          </h2>
          <p>Created: {formatDateSeconds(props.dateCreated)}</p>
          <p>{props.brief}</p>
        </Link>
      </List.Item>
    );
  }
}

const CCRItem = view(CCRItemNaked);
export default CCRItem;
