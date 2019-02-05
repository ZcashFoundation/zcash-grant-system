import React from 'react';
import { view } from 'react-easy-state';
import { List, Avatar } from 'antd';
import { Link } from 'react-router-dom';
import { User } from 'src/types';
import './UserItem.less';

class UserItemNaked extends React.Component<User> {
  render() {
    const p = this.props;
    const actions = [<Link to={`/users/${p.userid}`} key="view">view</Link>];

    return (
      <List.Item key={p.userid} className="UserItem" actions={actions}>
        <List.Item.Meta
          avatar={
            <Avatar
              shape="square"
              icon="user"
              src={(p.avatar && p.avatar.imageUrl) || ''}
            />
          }
          title={p.displayName}
          description={p.emailAddress}
        />
      </List.Item>
    );
  }
}

const UserItem = view(UserItemNaked);
export default UserItem;
