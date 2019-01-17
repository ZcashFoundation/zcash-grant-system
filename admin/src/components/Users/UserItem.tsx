import React from 'react';
import { view } from 'react-easy-state';
import { Popconfirm, List, Avatar } from 'antd';
import { Link } from 'react-router-dom';
import store from 'src/store';
import { User } from 'src/types';
import './UserItem.less';

class UserItemNaked extends React.Component<User> {
  render() {
    const p = this.props;

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
    const viewAction = <Link to={`/users/${p.userid}`}>view</Link>;
    const actions = [viewAction, deleteAction];

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
  private handleDelete = () => {
    store.deleteUser(this.props.userid);
  };
}

const UserItem = view(UserItemNaked);
export default UserItem;
