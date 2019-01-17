import React from 'react';
import { view } from 'react-easy-state';
import { Button, List } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import store from 'src/store';
import { User } from 'src/types';
import UserItem from './UserItem';
import './index.less';

type Props = RouteComponentProps<any>;

class UsersNaked extends React.Component<Props> {
  componentDidMount() {
    store.fetchUsers();
  }

  render() {
    const { users, usersFetched, usersFetching } = store;
    const loading = !usersFetched || usersFetching;

    return (
      <div className="Users">
        <div className="Users-controls">
          <Button title="refresh" icon="reload" onClick={() => store.fetchUsers()} />
        </div>
        <List
          className="Users-list"
          bordered
          dataSource={users}
          loading={loading}
          renderItem={(u: User) => <UserItem key={u.userid} {...u} />}
        />
      </div>
    );
  }
}

const Users = withRouter(view(UsersNaked));
export default Users;
