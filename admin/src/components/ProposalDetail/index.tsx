import React from 'react';
import BN from 'bn.js';
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
  Input,
  Tag,
  message,
} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import store from 'src/store';
import { formatDateSeconds, formatDurationSeconds } from 'util/time';
import {
  PROPOSAL_STATUS,
  PROPOSAL_ARBITER_STATUS,
  MILESTONE_STAGE,
  PROPOSAL_STAGE,
} from 'src/types';
import { Link } from 'react-router-dom';
import Back from 'components/Back';
import Markdown from 'components/Markdown';
import ArbiterControl from 'components/ArbiterControl';
import { toZat, fromZat } from 'src/util/units';
import FeedbackModal from '../FeedbackModal';
import './index.less';

type Props = RouteComponentProps<any>;

const STATE = {
  paidTxId: '',
  showCancelAndRefundPopover: false,
  showChangeToAcceptedWithFundingPopover: false,
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
    const { proposalDetail: p, proposalDetailFetching } = store;

    if (!p || (p && p.proposalId !== id) || proposalDetailFetching) {
      return 'loading proposal...';
    }

    const needsArbiter =
      PROPOSAL_ARBITER_STATUS.MISSING === p.arbiter.status &&
      p.status === PROPOSAL_STATUS.LIVE &&
      !p.isFailed &&
      p.stage !== PROPOSAL_STAGE.COMPLETED;
    const refundablePct = p.milestones.reduce((prev, m) => {
      return m.datePaid ? prev - parseFloat(m.payoutPercent) : prev;
    }, 100);

    const { isVersionTwo } = p;
    const shouldShowArbiter =
      !isVersionTwo || (isVersionTwo && p.acceptedWithFunding === true);
    const cancelButtonText = isVersionTwo ? 'Cancel' : 'Cancel & refund';
    const shouldShowChangeToAcceptedWithFunding =
      isVersionTwo && p.acceptedWithFunding === false;

    const renderCancelControl = () => {
      const disabled = this.getCancelAndRefundDisabled();

      return (
        <Popconfirm
          title={
            <p>
              Are you sure you want to cancel proposal and begin
              <br />
              the refund process? This cannot be undone.
            </p>
          }
          placement="left"
          cancelText="cancel"
          okText="confirm"
          visible={this.state.showCancelAndRefundPopover}
          okButtonProps={{
            loading: store.proposalDetailCanceling,
          }}
          onCancel={this.handleCancelCancel}
          onConfirm={this.handleConfirmCancel}
        >
          <Button
            icon="close-circle"
            className="ProposalDetail-controls-control"
            loading={store.proposalDetailCanceling}
            onClick={this.handleCancelAndRefundClick}
            disabled={disabled}
            block
          >
            {cancelButtonText}
          </Button>
        </Popconfirm>
      );
    };

    const renderChangeToAcceptedWithFundingControl = () => {
      return (
        <Popconfirm
          title={
            <p>
              Are you sure you want to accept the proposal
              <br />
              with funding? This cannot be undone.
            </p>
          }
          placement="left"
          cancelText="cancel"
          okText="confirm"
          visible={this.state.showChangeToAcceptedWithFundingPopover}
          okButtonProps={{
            loading: store.proposalDetailCanceling,
          }}
          onCancel={this.handleChangeToAcceptWithFundingCancel}
          onConfirm={this.handleChangeToAcceptWithFundingConfirm}
        >
          <Button
            icon="close-circle"
            className="ProposalDetail-controls-control"
            loading={store.proposalDetailChangingToAcceptedWithFunding}
            onClick={this.handleChangeToAcceptedWithFunding}
            block
          >
            Accept With Funding
          </Button>
        </Popconfirm>
      );
    };

    const renderArbiterControl = () => (
      <ArbiterControl
        {...p}
        buttonProps={{
          type: 'default',
          className: 'ProposalDetail-controls-control',
          block: true,
          disabled:
            p.status !== PROPOSAL_STATUS.LIVE ||
            p.isFailed ||
            p.stage === PROPOSAL_STAGE.COMPLETED,
        }}
      />
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
                className="ProposalDetail-review"
                loading={store.proposalDetailApproving}
                icon="check"
                type="primary"
                onClick={() => this.handleApprove(true)}
              >
                Approve With Funding
              </Button>
              <Button
                className="ProposalDetail-review"
                loading={store.proposalDetailApproving}
                icon="check"
                type="default"
                onClick={() => this.handleApprove(false)}
              >
                Approve Without Funding
              </Button>
              <Button
                className="ProposalDetail-review"
                loading={store.proposalDetailApproving}
                icon="close"
                type="danger"
                onClick={() => {
                  FeedbackModal.open({
                    title: 'Reject this proposal?',
                    label: 'Please provide a reason:',
                    okText: 'Reject',
                    onOk: this.handleReject,
                  });
                }}
              >
                Reject
              </Button>
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

    const renderNominateArbiter = () =>
      needsArbiter &&
      shouldShowArbiter && (
        <Alert
          showIcon
          type="warning"
          message="No arbiter on live proposal"
          description={
            <div>
              <p>An arbiter is required to review milestone payout requests.</p>
              <ArbiterControl {...p} />
            </div>
          }
        />
      );

    const renderNominatedArbiter = () =>
      PROPOSAL_ARBITER_STATUS.NOMINATED === p.arbiter.status &&
      p.status === PROPOSAL_STATUS.LIVE && (
        <Alert
          showIcon
          type="info"
          message="Arbiter has been nominated"
          description={
            <div>
              <p>
                <b>{p.arbiter.user!.displayName}</b> has been nominated for arbiter of
                this proposal but has not yet accepted.
              </p>
              <ArbiterControl {...p} />
            </div>
          }
        />
      );

    const renderMilestoneAccepted = () => {
      if (p.stage === PROPOSAL_STAGE.FAILED || p.stage === PROPOSAL_STAGE.CANCELED) {
        return;
      }
      if (
        !(
          p.status === PROPOSAL_STATUS.LIVE &&
          p.currentMilestone &&
          p.currentMilestone.stage === MILESTONE_STAGE.ACCEPTED
        )
      ) {
        return;
      }
      const ms = p.currentMilestone;
      const amount = fromZat(
        toZat(p.target)
          .mul(new BN(ms.payoutPercent))
          .divn(100),
      );
      return (
        <Alert
          className="ProposalDetail-alert"
          showIcon
          type="warning"
          message={null}
          description={
            <div>
              <p>
                <b>
                  Milestone {ms.index + 1} - {ms.title}
                </b>{' '}
                was accepted on {formatDateSeconds(ms.dateAccepted)}.
              </p>
              <p>
                {' '}
                Please make a payment of <b>{amount.toString()} ZEC</b> to:
              </p>{' '}
              <pre>{p.payoutAddress}</pre>
              <Input.Search
                placeholder="please enter payment txid"
                value={this.state.paidTxId}
                enterButton="Mark Paid"
                onChange={e => this.setState({ paidTxId: e.target.value })}
                onSearch={this.handlePaidMilestone}
              />
            </div>
          }
        />
      );
    };

    const renderFailed = () =>
      p.isFailed && (
        <Alert
          showIcon
          type="error"
          message={
            p.stage === PROPOSAL_STAGE.FAILED ? 'Proposal failed' : 'Proposal canceled'
          }
          description={
            p.stage === PROPOSAL_STAGE.FAILED ? (
              <>
                This proposal failed to reach its funding goal of <b>{p.target} ZEC</b> by{' '}
                <b>{formatDateSeconds(p.datePublished + p.deadlineDuration)}</b>. All
                contributors will need to be refunded.
              </>
            ) : (
              <>
                This proposal was canceled by an admin, and will be refunding contributors{' '}
                <b>{refundablePct}%</b> of their contributions.
              </>
            )
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
            {renderNominateArbiter()}
            {renderNominatedArbiter()}
            {renderMilestoneAccepted()}
            {renderFailed()}
            <Collapse defaultActiveKey={['brief', 'content', 'milestones']}>
              <Collapse.Panel key="brief" header="brief">
                {p.brief}
              </Collapse.Panel>

              <Collapse.Panel key="content" header="content">
                <Markdown source={p.content} />
              </Collapse.Panel>

              <Collapse.Panel key="milestones" header="milestones">
                {p.milestones.map((milestone, i) => (
                  <Card
                    title={
                      <>
                        {milestone.title + ' '}
                        {milestone.immediatePayout && (
                          <Tag color="magenta">Immediate Payout</Tag>
                        )}
                      </>
                    }
                    extra={`${milestone.payoutPercent}% Payout`}
                    key={i}
                  >
                    {p.isVersionTwo && (
                      <p>
                        <b>Estimated Days to Complete:</b>{' '}
                        {milestone.immediatePayout ? 'N/A' : milestone.daysEstimated}{' '}
                      </p>
                    )}
                    <p>
                      <b>Estimated Date:</b>{' '}
                      {milestone.dateEstimated
                        ? formatDateSeconds(milestone.dateEstimated)
                        : 'N/A'}{' '}
                    </p>

                    <p>{milestone.content}</p>
                  </Card>
                ))}
              </Collapse.Panel>

              <Collapse.Panel key="json" header="json">
                <pre>{JSON.stringify(p, null, 4)}</pre>
              </Collapse.Panel>
            </Collapse>
          </Col>

          {/* RIGHT SIDE */}
          <Col span={6}>
            {/* ACTIONS */}
            <Card size="small" className="ProposalDetail-controls">
              {renderCancelControl()}
              {renderArbiterControl()}
              {shouldShowChangeToAcceptedWithFunding &&
                renderChangeToAcceptedWithFundingControl()}
            </Card>

            {/* DETAILS */}
            <Card title="Details" size="small">
              {renderDeetItem('id', p.proposalId)}
              {renderDeetItem('created', formatDateSeconds(p.dateCreated))}
              {renderDeetItem(
                'published',
                p.datePublished ? formatDateSeconds(p.datePublished) : 'n/a',
              )}
              {renderDeetItem(
                'deadlineDuration',
                formatDurationSeconds(p.deadlineDuration),
              )}
              {p.datePublished &&
                renderDeetItem(
                  '(deadline)',
                  formatDateSeconds(p.datePublished + p.deadlineDuration),
                )}
              {renderDeetItem('isFailed', JSON.stringify(p.isFailed))}
              {renderDeetItem('status', p.status)}
              {renderDeetItem('stage', p.stage)}
              {renderDeetItem('target', p.target)}
              {renderDeetItem('contributed', p.contributed)}
              {renderDeetItem('funded (inc. matching)', p.funded)}
              {renderDeetItem('matching', p.contributionMatching)}
              {renderDeetItem('bounty', p.contributionBounty)}
              {renderDeetItem('rfpOptIn', JSON.stringify(p.rfpOptIn))}
              {renderDeetItem(
                'acceptedWithFunding',
                JSON.stringify(p.acceptedWithFunding),
              )}
              {renderDeetItem(
                'arbiter',
                <>
                  {p.arbiter.user && (
                    <Link to={`/users/${p.arbiter.user.userid}`}>
                      {p.arbiter.user.displayName}
                    </Link>
                  )}
                  ({p.arbiter.status})
                </>,
              )}
              {p.rfp &&
                renderDeetItem(
                  'rfp',
                  <Link to={`/rfps/${p.rfp.id}`}>{p.rfp.title}</Link>,
                )}
            </Card>

            {/* TEAM */}
            <Card title="Team" size="small">
              {p.team.map(t => (
                <div key={t.userid}>
                  <Link to={`/users/${t.userid}`}>{t.displayName}</Link>
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  private getCancelAndRefundDisabled = () => {
    const { proposalDetail: p } = store;
    if (!p) {
      return true;
    }
    return (
      p.status !== PROPOSAL_STATUS.LIVE ||
      p.stage === PROPOSAL_STAGE.FAILED ||
      p.stage === PROPOSAL_STAGE.CANCELED ||
      p.isFailed
    );
  };

  private handleCancelAndRefundClick = () => {
    const disabled = this.getCancelAndRefundDisabled();
    if (!disabled) {
      if (!this.state.showCancelAndRefundPopover) {
        this.setState({ showCancelAndRefundPopover: true });
      }
    }
  };

  private handleChangeToAcceptedWithFunding = () => {
    this.setState({ showChangeToAcceptedWithFundingPopover: true });
  };

  private handleChangeToAcceptWithFundingCancel = () => {
    this.setState({ showChangeToAcceptedWithFundingPopover: false });
  };

  private handleChangeToAcceptWithFundingConfirm = () => {
    if (!store.proposalDetail) return;
    store.changeProposalToAcceptedWithFunding(store.proposalDetail.proposalId);
    this.setState({ showChangeToAcceptedWithFundingPopover: false });
  };

  private getIdFromQuery = () => {
    return Number(this.props.match.params.id);
  };

  private loadDetail = () => {
    store.fetchProposalDetail(this.getIdFromQuery());
  };

  private handleCancelCancel = () => {
    this.setState({ showCancelAndRefundPopover: false });
  };

  private handleConfirmCancel = () => {
    if (!store.proposalDetail) return;
    store.cancelProposal(store.proposalDetail.proposalId);
    this.setState({ showCancelAndRefundPopover: false });
  };

  private handleApprove = (withFunding: boolean) => {
    store.approveProposal(true, withFunding);
  };

  private handleReject = async (reason: string) => {
    await store.approveProposal(false, false, reason);
    message.info('Proposal rejected');
  };

  private handlePaidMilestone = async () => {
    const pid = store.proposalDetail!.proposalId;
    const mid = store.proposalDetail!.currentMilestone!.id;
    await store.markMilestonePaid(pid, mid, this.state.paidTxId);
    message.success('Marked milestone paid.');
  };
}

const ProposalDetail = withRouter(view(ProposalDetailNaked));
export default ProposalDetail;
