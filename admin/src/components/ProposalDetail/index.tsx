import React from 'react';
import { view } from 'react-easy-state';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  Row,
  Col,
  Card,
  Alert,
  Button,
  Collapse,
  Popconfirm,
  Modal,
  Input,
  Switch,
} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import store from 'src/store';
import { formatDateSeconds } from 'util/time';
import { PROPOSAL_STATUS } from 'src/types';
import { Link } from 'react-router-dom';
import Back from 'components/Back';
import Info from 'components/Info';
import Markdown from 'components/Markdown';
import './index.less';

type Props = RouteComponentProps<any>;

const STATE = {
  showRejectModal: false,
  rejectReason: '',
};

type State = typeof STATE;

class ProposalDetailNaked extends React.Component<Props, State> {
  state = STATE;
  rejectInput: null | TextArea = null;
  componentDidMount() {
    this.loadDetail();
  }
  render() {
    const id = this.getIdFromQuery();
    const { proposalDetail: p, proposalDetailFetching, proposalDetailApproving } = store;
    const { rejectReason, showRejectModal } = this.state;

    if (!p || (p && p.proposalId !== id) || proposalDetailFetching) {
      return 'loading proposal...';
    }

    const renderDelete = () => (
      <Popconfirm
        onConfirm={this.handleDelete}
        title="Delete proposal?"
        okText="delete"
        cancelText="cancel"
      >
        <Button icon="delete" className="ProposalDetail-controls-control" block>
          Delete
        </Button>
      </Popconfirm>
    );

    const renderMatching = () => (
      <div className="ProposalDetail-controls-control">
        <Popconfirm
          overlayClassName="ProposalDetail-popover-overlay"
          onConfirm={this.handleToggleMatching}
          title={
            <>
              <div>
                Turn {p.contributionMatching ? 'off' : 'on'} contribution matching?
              </div>
              {p.status === PROPOSAL_STATUS.LIVE && (
                <div>
                  This is a LIVE proposal, this will alter the funding state of the
                  proposal!
                </div>
              )}
            </>
          }
          okText="ok"
          cancelText="cancel"
        >
          <Switch checked={p.contributionMatching === 1} loading={false} />{' '}
        </Popconfirm>
        <span>
          matching{' '}
          <Info
            placement="right"
            content={
              <span>
                <b>Contribution matching</b>
                <br /> Funded amount will be multiplied by 2.
              </span>
            }
          />
        </span>
      </div>
    );

    const renderApproved = () =>
      p.status === PROPOSAL_STATUS.APPROVED && (
        <Alert
          showIcon
          type="success"
          message={`Approved on ${formatDateSeconds(p.dateApproved)}`}
          description={`
            This proposal has been approved and will become live when a team-member
            publishes it.
          `}
        />
      );

    const rejectModal = (
      <Modal
        visible={showRejectModal}
        title="Reject this proposal"
        onOk={this.handleReject}
        onCancel={() => this.setState({ showRejectModal: false })}
        okButtonProps={{
          disabled: rejectReason.length === 0,
          loading: proposalDetailApproving,
        }}
        cancelButtonProps={{
          loading: proposalDetailApproving,
        }}
      >
        Please provide a reason ({!!rejectReason.length && `${rejectReason.length}/`}
        250 chars max):
        <Input.TextArea
          ref={ta => (this.rejectInput = ta)}
          rows={4}
          maxLength={250}
          required={true}
          value={rejectReason}
          onChange={e => {
            this.setState({ rejectReason: e.target.value });
          }}
        />
      </Modal>
    );

    const renderReview = () =>
      p.status === PROPOSAL_STATUS.PENDING && (
        <Alert
          showIcon
          type="warning"
          message="Review Pending"
          description={
            <div>
              <p>Please review this proposal and render your judgment.</p>
              <Button
                loading={store.proposalDetailApproving}
                icon="check"
                type="primary"
                onClick={this.handleApprove}
              >
                Approve
              </Button>
              <Button
                loading={store.proposalDetailApproving}
                icon="close"
                type="danger"
                onClick={() => {
                  this.setState({ showRejectModal: true });
                  // hacky way of waiting for modal to render in before focus
                  setTimeout(() => {
                    if (this.rejectInput) this.rejectInput.focus();
                  }, 200);
                }}
              >
                Reject
              </Button>
              {rejectModal}
            </div>
          }
        />
      );

    const renderRejected = () =>
      p.status === PROPOSAL_STATUS.REJECTED && (
        <Alert
          showIcon
          type="error"
          message="Rejected"
          description={
            <div>
              <p>
                This proposal has been rejected. The team will be able to re-submit it for
                approval should they desire to do so.
              </p>
              <b>Reason:</b>
              <br />
              <i>{p.rejectReason}</i>
            </div>
          }
        />
      );

    const renderDeetItem = (name: string, val: any) => (
      <div className="ProposalDetail-deet">
        <span>{name}</span>
        {val} &nbsp;
      </div>
    );

    return (
      <div className="ProposalDetail">
        <Back to="/proposals" text="Proposals" />
        <h1>{p.title}</h1>
        <Row gutter={16}>
          {/* MAIN */}
          <Col span={18}>
            {renderApproved()}
            {renderReview()}
            {renderRejected()}
            <Collapse defaultActiveKey={['brief', 'content']}>
              <Collapse.Panel key="brief" header="brief">
                {p.brief}
              </Collapse.Panel>

              <Collapse.Panel key="content" header="content">
                <Markdown source={p.content} />
              </Collapse.Panel>

              {/* TODO - comments, milestones, updates &etc. */}
              <Collapse.Panel key="json" header="json">
                <pre>{JSON.stringify(p, null, 4)}</pre>
              </Collapse.Panel>
            </Collapse>
          </Col>

          {/* RIGHT SIDE */}
          <Col span={6}>
            {/* ACTIONS */}
            <Card size="small" className="ProposalDetail-controls">
              {renderDelete()}
              {renderMatching()}
              {/* TODO - other actions */}
            </Card>

            {/* DETAILS */}
            <Card title="Details" size="small">
              {renderDeetItem('id', p.proposalId)}
              {renderDeetItem('created', formatDateSeconds(p.dateCreated))}
              {renderDeetItem('status', p.status)}
              {renderDeetItem('category', p.category)}
              {renderDeetItem('target', p.target)}
              {renderDeetItem('contributed', p.contributed)}
              {renderDeetItem('funded (inc. matching)', p.funded)}
              {renderDeetItem('matching', p.contributionMatching)}
              {p.rfp &&
                renderDeetItem('rfp', <Link to={`/rfps/${p.rfp.id}`}>{p.rfp.title}</Link>)
              }
            </Card>

            {/* TEAM */}
            <Card title="Team" size="small">
              {p.team.map(t => (
                <div key={t.userid}>
                  <Link to={`/users/${t.userid}`}>{t.displayName}</Link>
                </div>
              ))}
            </Card>

            {/* TODO: contributors here? */}
          </Col>
        </Row>
      </div>
    );
  }

  private getIdFromQuery = () => {
    return Number(this.props.match.params.id);
  };

  private loadDetail = () => {
    store.fetchProposalDetail(this.getIdFromQuery());
  };

  private handleDelete = () => {
    if (!store.proposalDetail) return;
    store.deleteProposal(store.proposalDetail.proposalId);
  };

  private handleApprove = () => {
    store.approveProposal(true);
  };

  private handleReject = async () => {
    await store.approveProposal(false, this.state.rejectReason);
    this.setState({ showRejectModal: false });
  };

  private handleToggleMatching = async () => {
    if (store.proposalDetail) {
      // we lock this to be 1 or 0 for now, we may support more values later on
      const contributionMatching =
        store.proposalDetail.contributionMatching === 0 ? 1 : 0;
      store.updateProposalDetail({ contributionMatching });
    }
  };
}

const ProposalDetail = withRouter(view(ProposalDetailNaked));
export default ProposalDetail;
