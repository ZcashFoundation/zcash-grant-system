import React from 'react';
import { view } from 'react-easy-state';
import { Button, Popover, Icon } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import store from 'src/store';
import { User } from 'src/types';
import Field from 'components/Field';
import './index.less';

type Props = RouteComponentProps<any>;

class UsersNaked extends React.Component<Props> {
  componentDidMount() {
    store.fetchUsers();
  }

  render() {
    const id = parseInt(this.props.match.params.id, 10);
    const { users, usersFetched } = store;

    if (!usersFetched) {
      return 'loading users...';
    }

    if (id) {
      const singleUser = users.find(u => u.userid === id);
      if (singleUser) {
        return (
          <div className="Users">
            <div className="Users-controls">
              <Link to="/users">users</Link> <Icon type="right" /> {id}{' '}
              <Button title="refresh" icon="reload" onClick={() => store.fetchUsers()} />
            </div>
            <UserItem key={singleUser.userid} {...singleUser} />
          </div>
        );
      } else {
        return `could not find user: ${id}`;
      }
    }

    return (
      <div className="Users">
        <div className="Users-controls">
          <Button title="refresh" icon="reload" onClick={() => store.fetchUsers()} />
        </div>
        {users.length === 0 && <div>no users</div>}
        {users.length > 0 && users.map(u => <UserItem key={u.userid} {...u} />)}
      </div>
    );
  }
}

// tslint:disable-next-line:max-classes-per-file
class UserItemNaked extends React.Component<User> {
  state = {
    showProposals: false,
    activeProposal: '',
    showDelete: false,
  };
  render() {
    const u = this.props;
    return (
      <div key={u.userid} className="Users-user">
        <div>
          <div className="Users-user-controls">
            <Popover
              content={
                <div>
                  <Button type="primary" onClick={this.handleDelete}>
                    delete {u.emailAddress}
                  </Button>{' '}
                  <Button onClick={() => this.setState({ showDelete: false })}>
                    cancel
                  </Button>
                </div>
              }
              title="Permanently delete user?"
              trigger="click"
              visible={this.state.showDelete}
              onVisibleChange={showDelete => this.setState({ showDelete })}
            >
              <Button icon="delete" shape="circle" size="small" title="delete" />
            </Popover>
            {/* TODO: implement silence user on BE */}
            <Button
              icon="notification"
              shape="circle"
              size="small"
              title={false ? 'allow commenting' : 'disable commenting'}
              type={false ? 'danger' : 'default'}
              disabled={true}
            />
          </div>
          <div className="Users-user-img">
            {u.avatar ? <img src={u.avatar.imageUrl} /> : 'n/a'}
          </div>
        </div>

        <div>
          <Field title="displayName" value={u.displayName} />
          <Field title="title" value={u.title} />
          <Field title="emailAddress" value={u.emailAddress} />
          <Field title="userid" value={u.userid} />
          <Field
            title="avatar.imageUrl"
            value={(u.avatar && u.avatar.imageUrl) || 'n/a'}
          />
          <Field
            title={`proposals (${u.proposals.length})`}
            value={
              <div className="Users-user-proposals">
                {u.proposals.map(p => (
                  <div key={p.proposalId}>
                    {p.title} (
                    <Link to={`/proposals/${p.proposalId}`}>{p.proposalId}</Link>)
                  </div>
                ))}
              </div>
            }
          />
          <Field
            title={`comments (${u.comments.length})`}
            value={<div>TODO: comments</div>}
          />
        </div>
      </div>
    );
  }
  private handleDelete = () => {
    store.deleteUser(this.props.userid);
  };
}
const UserItem = view(UserItemNaked);

const Users = withRouter(view(UsersNaked));
export default Users;
