import React from 'react';
import { view } from 'react-easy-state';
import { RouteComponentProps, withRouter } from 'react-router';
import store from 'src/store';
import Pageable from 'components/Pageable';
import { User } from 'src/types';
import UserItem from './UserItem';
import { userFilters } from 'util/filters';
import './index.less';

type Props = RouteComponentProps<any>;

class UsersNaked extends React.Component<Props> {
  componentDidMount() {
    store.fetchUsers();
  }

  render() {
    const { page } = store.users;
    // NOTE: sync with /backend ... pagination.py UserPagination.SORT_MAP
    const sorts = ['EMAIL:DESC', 'EMAIL:ASC', 'NAME:DESC', 'NAME:ASC'];
    return (
      <Pageable
        page={page}
        filters={userFilters}
        sorts={sorts}
        searchPlaceholder="Search user email or display name"
        renderItem={(u: User) => <UserItem key={u.userid} {...u} />}
        handleSearch={store.fetchUsers}
        handleChangeQuery={store.setUserPageQuery}
        handleResetQuery={store.resetUserPageQuery}
      />
    );
  }
}

const Users = withRouter(view(UsersNaked));
export default Users;
