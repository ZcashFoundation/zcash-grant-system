import React from 'react';
import { view } from 'react-easy-state';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  Row,
  Col,
  Card,
  Button,
  Collapse,
  Popconfirm,
  Avatar,
  List,
  message,
  Switch,
  Modal,
} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import store from 'src/store';
import { Proposal, Comment, Contribution } from 'src/types';
import { formatDateSeconds, formatDateMs } from 'util/time';
import { Link } from 'react-router-dom';
import Back from 'components/Back';
import './index.less';
import Markdown from 'components/Markdown';
import FeedbackModal from 'components/FeedbackModal';
import Info from '../Info';

type Props = RouteComponentProps<any>;

const STATE = {};

type State = typeof STATE;

class UserDetailNaked extends React.Component<Props, State> {
  state = STATE;
  rejectInput: null | TextArea = null;

  componentDidMount() {
    this.loadDetail();
  }

  render() {
    const id = this.getIdFromQuery();
    const { userDetail: u, userDetailFetching } = store;

    if (!u || (u && u.userid !== id) || userDetailFetching) {
      return 'loading user...';
    }

    const renderDelete = () => (
      <Popconfirm
        onConfirm={this.handleDelete}
        title={
          <>
            Are you sure? Due to GDPR compliance,
            <br />
            this <strong>cannot</strong> be undone.
          </>
        }
        okText="Delete"
        cancelText="Cancel"
        okType="danger"
      >
        <Button
          icon="delete"
          type="danger"
          className="UserDetail-controls-control"
          ghost
          block
        >
          Delete
        </Button>
      </Popconfirm>
    );

    const renderSilenceControl = () => (
      <div className="UserDetail-controls-control">
        <Popconfirm
          overlayClassName="UserDetail-popover-overlay"
          onConfirm={this.handleToggleSilence}
          title={<>{u.silenced ? 'Allow' : 'Disallow'} commenting?</>}
          okText="ok"
          cancelText="cancel"
        >
          <Switch checked={u.silenced} loading={store.userSaving} />{' '}
        </Popconfirm>
        <span>
          Silence{' '}
          <Info
            placement="right"
            content={
              <span>
                <b>Silence User</b>
                <br /> User will not be able to comment.
              </span>
            }
          />
        </span>
      </div>
    );

    const renderAdminControl = () => (
      <div className="UserDetail-controls-control">
        <Popconfirm
          overlayClassName="UserDetail-popover-overlay"
          onConfirm={this.handleToggleAdmin}
          title={<>{u.isAdmin ? 'Remove admin privileges?' : 'Add admin privileges?'}</>}
          okText="ok"
          cancelText="cancel"
        >
          <Switch checked={u.isAdmin} loading={store.userSaving} />{' '}
        </Popconfirm>
        <span>
          Admin{' '}
          <Info
            placement="right"
            content={
              <span>
                <b>Admin User</b>
                <br /> User will be able to log into this (admin) interface with full
                privileges.
              </span>
            }
          />
        </span>
      </div>
    );

    const renderBanControl = () => (
      <div className="UserDetail-controls-control">
        <Switch
          checked={u.banned}
          onChange={this.handleToggleBan}
          loading={store.userSaving}
        />{' '}
        <span>
          Ban{' '}
          <Info
            placement="right"
            content={
              <span>
                <b>Ban User</b>
                <br /> User will not be able to sign-in or perform authenticated actions.
              </span>
            }
          />
        </span>
      </div>
    );

    const renderDeetItem = (name: string, val: any) => (
      <div className="UserDetail-deet">
        <span>{name}</span>
        <div>{(val && val) || 'n/a'}</div>
      </div>
    );

    return (
      <div className="UserDetail">
        <Back to="/users" text="Users" />
        <h1>
          <Avatar
            size="default"
            shape="square"
            icon="user"
            src={(u.avatar && u.avatar.imageUrl) || ''}
          />
          <span>
            {u.displayName} - {u.emailAddress}
          </span>
        </h1>
        <Row gutter={16}>
          {/* MAIN */}
          <Col span={18}>
            {/* DETAILS */}
            <Card title="details" size="small">
              {renderDeetItem('userid', u.userid)}
              {renderDeetItem('displayName', u.displayName)}
              {renderDeetItem('emailAddress', u.emailAddress)}
              {renderDeetItem('title', u.title)}
              {(u.socialMedias.length > 0 &&
                u.socialMedias.map((sm, idx) => (
                  <div key={sm.service}>
                    {renderDeetItem(
                      `socialMedias[${idx}]`,
                      <>
                        {sm.service}/{sm.username} <a href={sm.url}>{sm.url}</a>
                      </>,
                    )}
                  </div>
                ))) ||
                renderDeetItem('socialMedias', '')}
              {renderDeetItem(
                'avatar.imageUrl',
                u.avatar && <a href={u.avatar.imageUrl}>{u.avatar.imageUrl}</a>,
              )}
            </Card>
            <Collapse defaultActiveKey={['proposals', 'contributions']}>
              {/* PROPOSALS */}
              <Collapse.Panel
                key="proposals"
                header={`proposals (${u.proposals.length})`}
              >
                <List
                  size="small"
                  dataSource={u.proposals}
                  renderItem={(p: Proposal) => (
                    <List.Item
                      actions={[
                        <Link key="view" to={`/proposals/${p.proposalId}`}>
                          view
                        </Link>,
                      ]}
                    >
                      <List.Item.Meta
                        title={p.title || '(no title)'}
                        description={p.brief || '(no brief)'}
                      />
                    </List.Item>
                  )}
                />
              </Collapse.Panel>

              {/* CONTRIBUTIONS */}
              <Collapse.Panel
                key="contributions"
                header={`contributions (${u.contributions.length})`}
              >
                <List
                  size="small"
                  dataSource={u.contributions}
                  renderItem={(c: Contribution) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <div>
                            <b>{c.amount}</b>
                            ZEC to{' '}
                            <Link to={`/proposals/${c.proposal.proposalId}`}>
                              {c.proposal.title}
                            </Link>{' '}
                            on {formatDateSeconds(c.dateCreated)}
                          </div>
                        }
                        description={
                          <>
                            id: {c.id}, status: {c.status}
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Collapse.Panel>

              {/* COMMENTS */}
              <Collapse.Panel key="comments" header={`comments (${u.comments.length})`}>
                <List
                  size="small"
                  dataSource={u.comments}
                  renderItem={(c: Comment) => (
                    <List.Item>
                      <List.Item.Meta
                        description={
                          <>
                            <div>
                              on{' '}
                              <Link to={`/proposals/${c.proposalId}`}>
                                {c.proposal && c.proposal.title}
                              </Link>{' '}
                              at {formatDateMs(c.dateCreated)}
                            </div>
                            <Markdown
                              source={c.content}
                              reduced
                              className="UserDetail-comment"
                            />
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Collapse.Panel>

              {/* JSON */}
              <Collapse.Panel key="json" header="json">
                <pre>{JSON.stringify(u, null, 4)}</pre>
              </Collapse.Panel>
            </Collapse>
          </Col>

          {/* SIDE */}
          <Col span={6}>
            {/* ACTIONS */}
            <Card size="small" className="UserDetail-controls">
              {renderDelete()}
              {renderSilenceControl()}
              {renderBanControl()}
              {renderAdminControl()}
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  private getIdFromQuery = () => {
    return Number(this.props.match.params.id);
  };

  private loadDetail = () => {
    store.fetchUserDetail(this.getIdFromQuery());
  };

  private handleDelete = async () => {
    if (!store.userDetail) return;
    await store.deleteUser(store.userDetail.userid);
    if (store.userDeleted) {
      message.success('Successfully deleted', 2);
      this.props.history.replace('/users');
    }
  };

  private handleToggleSilence = async () => {
    if (store.userDetail) {
      const ud = store.userDetail;
      const newSilenced = !ud.silenced;
      await store.editUser(ud.userid, { silenced: newSilenced });
      if (store.userSaved) {
        message.success(
          <>
            <b>{ud.displayName}</b> {newSilenced ? 'is silenced' : 'can comment again'}
          </>,
          2,
        );
      }
    }
  };

  private handleToggleAdmin = async () => {
    if (store.userDetail) {
      const ud = store.userDetail;
      const newAdmin = !ud.isAdmin;
      await store.editUser(ud.userid, { isAdmin: newAdmin });
      if (store.userSaved) {
        message.success(
          <>
            <b>{ud.displayName}</b> {newAdmin ? 'made admin' : 'no longer admin'}
          </>,
          2,
        );
      }
    }
  };

  private handleToggleBan = () => {
    if (store.userDetail) {
      const ud = store.userDetail;
      const newBanned = !ud.banned;
      const informSuccess = () => {
        if (store.userSaved) {
          message.success(
            <>
              <b>{ud.displayName}</b> has been{' '}
              {newBanned ? 'banned' : 'freed to roam the land'}
            </>,
            2,
          );
        }
      };

      if (newBanned) {
        FeedbackModal.open({
          title: 'Ban user?',
          content: 'They will not be able to login.',
          label: 'Please provide a reason:',
          okText: 'Ban',
          onOk: async reason => {
            await store.editUser(ud.userid, { banned: newBanned, bannedReason: reason });
            informSuccess();
          },
        });
      } else {
        Modal.confirm({
          title: 'Unban user?',
          okText: 'Unban',
          content: (
            <>
              <p>This user was banned for the following reason: </p>
              <q>{ud.bannedReason}</q>
            </>
          ),
          onOk: async () => {
            await store.editUser(ud.userid, { banned: newBanned });
            informSuccess();
          },
        });
      }
    }
  };
}

const UserDetail = withRouter(view(UserDetailNaked));
export default UserDetail;
