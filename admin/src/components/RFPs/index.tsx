import React from 'react';
import { view } from 'react-easy-state';
import { Button, List, Popconfirm, Spin, Tag, Tooltip, message } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { RFP_STATUSES, getStatusById } from 'util/statuses';
import store from 'src/store';
import './index.less';
import { RFP, PROPOSAL_STATUS } from 'src/types';

type Props = RouteComponentProps<any>;

interface State {
  deletingId: number | null;
}

class RFPs extends React.Component<Props, State> {
  state: State = {
    deletingId: null,
  };

  componentDidMount() {
    this.fetchRFPs();
  }

  render() {
    const { rfps, rfpsFetching, rfpsFetched } = store;
    const loading = !rfpsFetched || rfpsFetching;

    return (
      <div className="RFPs">
        <div className="RFPs-controls">
          <Link to="/rfps/new">
            <Button>Create new RFP</Button>
          </Link>
          <Button title="refresh" icon="reload" onClick={this.fetchRFPs} />
        </div>
        <List
          className="RFPs-list"
          bordered
          dataSource={rfps}
          loading={loading}
          renderItem={this.renderRFP}
        />
      </div>
    );
  }

  private fetchRFPs = () => {
    store.fetchRFPs();
  };

  private renderRFP = (rfp: RFP) => {
    const { deletingId } = this.state;
    const actions = [
      <Link key="edit" to={`/rfps/${rfp.id}/edit`}>
        edit
      </Link>,
      <Popconfirm
        key="delete"
        title="Are you sure?"
        okText="Delete"
        okType="danger"
        onConfirm={() => this.deleteRFP(rfp.id)}
        placement="left"
      >
        <a>delete</a>
      </Popconfirm>,
    ];
    const pendingProposals = rfp.proposals.filter(p => p.status === PROPOSAL_STATUS.PENDING);
    const acceptedProposals = rfp.proposals.filter(p =>
      p.status === PROPOSAL_STATUS.LIVE || p.status === PROPOSAL_STATUS.APPROVED
    );
    const status = getStatusById(RFP_STATUSES, rfp.status);
    return (
      <Spin key={rfp.id} spinning={deletingId === rfp.id}>
        <List.Item className="RFPs-list-rfp" actions={actions}>
          <Link to={`/rfps/${rfp.id}`}>
            <h2>
              {rfp.title || '(no title)'}
              <Tooltip title={status.hint}>
                <Tag color={status.tagColor}>{status.tagDisplay}</Tag>
              </Tooltip>
            </h2>
            <p>
              {pendingProposals.length} submitted
              {' · '}
              {acceptedProposals.length} accepted
            </p>
            <p>{rfp.brief}</p>
          </Link>
        </List.Item>
      </Spin>
    );
  };

  private deleteRFP = (id: number) => {
    this.setState({ deletingId: id }, async () => {
      await store.deleteRFP(id);
      if (store.rfpDeleted) {
        message.success('Successfully deleted', 2);
      }
      this.setState({ deletingId: null });
    });
  };
}

export default withRouter(view(RFPs));
