import { throttle } from 'lodash';
import React, { ReactNode } from 'react';
import moment from 'moment';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { Alert, Steps, Button, message, Modal, Input } from 'antd';
import { AlertProps } from 'antd/lib/alert';
import { StepProps } from 'antd/lib/steps';
import TextArea from 'antd/lib/input/TextArea';
import {
  Milestone,
  ProposalMilestone,
  MILESTONE_STAGE,
  PROPOSAL_ARBITER_STATUS,
} from 'types';
import { PROPOSAL_STAGE } from 'api/constants';
import UnitDisplay from 'components/UnitDisplay';
import Loader from 'components/Loader';
import { AppState } from 'store/reducers';
import Placeholder from 'components/Placeholder';
import { proposalActions } from 'modules/proposals';
import { ProposalDetail } from 'modules/proposals/reducers';
import './index.less';
import { Link } from 'react-router-dom';
import { formatUsd } from 'utils/formatters';
import { Zat } from 'utils/units';

enum STEP_STATUS {
  WAIT = 'wait',
  PROCESS = 'process',
  FINISH = 'finish',
  ERROR = 'error',
}

const milestoneStageToStepState = {
  [MILESTONE_STAGE.IDLE]: STEP_STATUS.WAIT,
  [MILESTONE_STAGE.REQUESTED]: STEP_STATUS.PROCESS,
  [MILESTONE_STAGE.ACCEPTED]: STEP_STATUS.PROCESS,
  [MILESTONE_STAGE.REJECTED]: STEP_STATUS.ERROR,
  [MILESTONE_STAGE.ACCEPTED]: STEP_STATUS.FINISH,
} as { [key in MILESTONE_STAGE]: StepProps['status'] };

const fmtDate = (n: undefined | number) =>
  (n && moment(n * 1000).format('MMM Do, YYYY, h:mm a')) || undefined;

const fmtDateFromNow = (n: undefined | number) => (n && moment(n * 1000).fromNow()) || '';

interface OwnProps {
  proposal: ProposalDetail;
}

interface DispatchProps {
  requestPayout: typeof proposalActions.requestPayout;
  acceptPayout: typeof proposalActions.acceptPayout;
  rejectPayout: typeof proposalActions.rejectPayout;
}

type Props = OwnProps & DispatchProps;

interface State {
  step: number;
  activeMilestoneIdx: number;
  doTitlesOverflow: boolean;
  showRejectModal: boolean;
  rejectReason: string;
  rejectMilestoneId: number;
}

class ProposalMilestones extends React.Component<Props, State> {
  stepTitleRefs: Array<React.RefObject<HTMLDivElement>> = [];
  ref: React.RefObject<HTMLDivElement>;
  rejectInput: null | TextArea;
  throttledUpdateDoTitlesOverflow: () => void;

  constructor(props: Props) {
    super(props);
    this.rejectInput = null;
    this.stepTitleRefs = this.props.proposal.milestones.map(() => React.createRef());
    this.ref = React.createRef();
    this.throttledUpdateDoTitlesOverflow = throttle(this.updateDoTitlesOverflow, 500);
    const step =
      (this.props.proposal &&
        this.props.proposal.currentMilestone &&
        this.props.proposal.currentMilestone.index) ||
      0;
    this.state = {
      step,
      activeMilestoneIdx: 0,
      doTitlesOverflow: true,
      showRejectModal: false,
      rejectReason: '',
      rejectMilestoneId: -1,
    };
  }

  componentDidMount() {
    this.updateDoTitlesOverflow();
    window.addEventListener('resize', this.throttledUpdateDoTitlesOverflow);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.throttledUpdateDoTitlesOverflow);
  }

  componentDidUpdate(prevProps: Props, _: State) {
    const cm = this.props.proposal.currentMilestone;
    const pcm = prevProps.proposal.currentMilestone;
    const cmId = (cm && cm.id) || 0;
    const pcmId = (pcm && pcm.id) || 0;
    if (pcmId !== cmId) {
      this.setState({ step: (cm && cm.index) || 0 });
    }
    const {
      requestPayoutError,
      isRequestingPayout,
      acceptPayoutError,
      isAcceptingPayout,
      rejectPayoutError,
      isRejectingPayout,
    } = this.props.proposal;

    if (!prevProps.proposal.requestPayoutError && requestPayoutError) {
      message.error(requestPayoutError);
    }
    if (
      prevProps.proposal.isRequestingPayout &&
      !isRequestingPayout &&
      !requestPayoutError
    ) {
      message.success('Payout requested.');
    }

    if (!prevProps.proposal.acceptPayoutError && acceptPayoutError) {
      message.error(acceptPayoutError);
    }
    if (
      prevProps.proposal.isAcceptingPayout &&
      !isAcceptingPayout &&
      !acceptPayoutError
    ) {
      message.success('Payout approved.');
    }

    if (!prevProps.proposal.rejectPayoutError && rejectPayoutError) {
      message.error(rejectPayoutError);
    }
    if (
      prevProps.proposal.isRejectingPayout &&
      !isRejectingPayout &&
      !rejectPayoutError
    ) {
      message.info('Payout rejected.');
    }
  }

  render() {
    const { proposal, requestPayout, acceptPayout, rejectPayout } = this.props;
    const { rejectReason, showRejectModal } = this.state;
    if (!proposal) {
      return <Loader />;
    }
    const {
      milestones,
      currentMilestone,
      isRejectingPayout,
      isVersionTwo,
      acceptedWithFunding,
    } = proposal;
    const milestoneCount = milestones.length;
    const milestonesDisabled = isVersionTwo ? !acceptedWithFunding : false;

    // arbiter reject modal
    const rejectModal = (
      <Modal
        visible={showRejectModal}
        title="Reject this milestone payout"
        onOk={this.handleReject}
        onCancel={() => this.setState({ showRejectModal: false })}
        okButtonProps={{
          disabled: rejectReason.length === 0,
          loading: isRejectingPayout,
        }}
        cancelButtonProps={{
          loading: isRejectingPayout,
        }}
      >
        Please provide a reason:
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

    // generate steps
    const milestoneSteps = milestones.map((ms, i) => {
      const status =
        currentMilestone &&
        currentMilestone.index === i &&
        ms.stage === MILESTONE_STAGE.IDLE
          ? STEP_STATUS.PROCESS
          : milestoneStageToStepState[ms.stage];
      const className = this.state.step === i ? 'is-active' : 'is-inactive';
      const stepProps = {
        title: <div ref={this.stepTitleRefs[i]}>{ms.title}</div>,
        status,
        className,
        onClick: () => this.setState({ step: i }),
      };
      return { key: i, stepProps };
    });

    const stepSize = milestoneCount > 5 ? 'small' : 'default';
    const activeMilestone = proposal.milestones[this.state.step];
    const activeIsCurrent = proposal.currentMilestone
      ? activeMilestone.id === proposal.currentMilestone!.id
      : false;

    return (
      <div
        ref={this.ref}
        className={classnames({
          ['ProposalMilestones']: true,
          ['do-titles-overflow']: this.state.doTitlesOverflow,
        })}
      >
        {milestonesDisabled ? (
          <Placeholder
            title="Milestones unavailable"
            subtitle="Milestones are not tracked for proposals that have been accepted without funding"
          />
        ) : !!milestoneSteps.length ? (
          <>
            <Steps current={this.state.step} size={stepSize}>
              {milestoneSteps.map(mss => (
                <Steps.Step key={mss.key} {...mss.stepProps} />
              ))}
            </Steps>
            <Milestone
              isFunded={[PROPOSAL_STAGE.WIP, PROPOSAL_STAGE.COMPLETED].includes(
                proposal.stage,
              )}
              proposalId={proposal.proposalId}
              showRejectPayout={this.handleShowRejectPayout}
              {...{ requestPayout, acceptPayout, rejectPayout }}
              {...activeMilestone}
              isCurrent={activeIsCurrent}
              isTeamMember={proposal.isTeamMember || false}
              isArbiter={proposal.isArbiter || false}
              hasArbiter={
                !!proposal.arbiter.user &&
                proposal.arbiter.status === PROPOSAL_ARBITER_STATUS.ACCEPTED
              }
              isVersionTwo={proposal.isVersionTwo}
            />
          </>
        ) : (
          <Placeholder
            title="No milestones"
            subtitle="The creator of this proposal has not setup any milestones"
          />
        )}
        {rejectModal}
      </div>
    );
  }

  private handleShowRejectPayout = (milestoneId: number) => {
    this.setState({ showRejectModal: true, rejectMilestoneId: milestoneId });
    // try to focus on text-area after modal loads
    setTimeout(() => {
      if (this.rejectInput) this.rejectInput.focus();
    }, 200);
  };

  private handleReject = () => {
    const { proposalId } = this.props.proposal;
    const { rejectMilestoneId, rejectReason } = this.state;

    this.props.rejectPayout(proposalId, rejectMilestoneId, rejectReason);

    this.setState({ showRejectModal: false, rejectMilestoneId: -1, rejectReason: '' });
  };

  private updateDoTitlesOverflow = () => {
    // hmr can sometimes muck up refs, let's make sure they all exist
    if (!this.ref || !this.ref.current || !this.stepTitleRefs) {
      return;
    }
    if (!this.stepTitleRefs.reduce((a, r) => !!r.current && a, true)) {
      return;
    }

    let doTitlesOverflow = false;
    const stepCount = this.stepTitleRefs.length;
    if (stepCount > 1) {
      // avoiding style calculation here by hardcoding antd icon width + padding + margin
      const iconWidths = stepCount * 56;
      const totalWidth = this.ref.current.clientWidth;
      const last = this.stepTitleRefs[stepCount - 1].current;
      if (last) {
        // last title gets full space
        const lastWidth = last.clientWidth;
        const remainingWidth = totalWidth - (lastWidth + iconWidths);
        const remainingWidthSingle = remainingWidth / (stepCount - 1);
        // first titles have to share remaining space
        doTitlesOverflow = this.stepTitleRefs
          .slice(0, stepCount - 1)
          .reduce(
            (prev, r) =>
              prev || (r.current ? r.current.clientWidth : 0) > remainingWidthSingle,
            false,
          );
      }
    }
    this.setState({ doTitlesOverflow });
  };
}

// Milestone
type MSProps = ProposalMilestone & DispatchProps;
interface MilestoneProps extends MSProps {
  showRejectPayout: (milestoneId: number) => void;
  isTeamMember: boolean;
  isArbiter: boolean;
  hasArbiter: boolean;
  isCurrent: boolean;
  proposalId: number;
  isFunded: boolean;
  isVersionTwo: boolean;
}
const Milestone: React.SFC<MilestoneProps> = p => {
  const estimatedDate = p.dateEstimated
    ? moment(p.dateEstimated * 1000).format('MMMM YYYY')
    : 'N/A';
  const reward = p.isVersionTwo ? (
    formatUsd(p.amount as string, true, 2)
  ) : (
    <UnitDisplay value={p.amount as Zat} symbol="ZEC" displayShortBalance={4} />
  );
  const getAlertProps = {
    [MILESTONE_STAGE.IDLE]: () => null,
    [MILESTONE_STAGE.REQUESTED]: () => ({
      type: 'info',
      message: (
        <>
          The team requested a payout for this milestone {fmtDateFromNow(p.dateRequested)}
          . It is currently under review.
        </>
      ),
    }),
    [MILESTONE_STAGE.REJECTED]: () => ({
      type: 'warning',
      message: (
        <span>
          Payout for this milestone was rejected {fmtDateFromNow(p.dateRejected)}.
          {p.isTeamMember ? ' You ' : ' The team '} can request another review for payout
          at any time.
        </span>
      ),
    }),
    [MILESTONE_STAGE.ACCEPTED]: () => ({
      type: 'info',
      message: (
        <span>
          Payout for this milestone was accepted {fmtDateFromNow(p.dateAccepted)}.{' '}
          <strong>{reward}</strong> will be sent to{' '}
          {p.isTeamMember ? ' you ' : ' the team '} soon.
        </span>
      ),
    }),
    [MILESTONE_STAGE.PAID]: () => ({
      type: 'success',
      message: (
        <span>
          The team was awarded <strong>{reward}</strong> {p.isVersionTwo && `in ZEC`}
          {p.immediatePayout && ` as an initial payout `} on {fmtDate(p.datePaid)}.
        </span>
      ),
    }),
  } as { [key in MILESTONE_STAGE]: () => AlertProps | null };

  const alertProps = getAlertProps[p.stage]();

  return (
    <div className="ProposalMilestones-milestone">
      <div className="ProposalMilestones-milestone-body">
        <div className="ProposalMilestones-milestone-description">
          <h3 className="ProposalMilestones-milestone-title">{p.title}</h3>
          <div className="ProposalMilestones-milestone-status">
            {!p.immediatePayout && (
              <div>
                Estimate: <strong>{estimatedDate}</strong>
              </div>
            )}
            <div>
              Reward: <strong>{reward}</strong>
            </div>
          </div>
          {alertProps && (
            <Alert {...alertProps} className="ProposalMilestones-milestone-alert" />
          )}
          {p.content}
        </div>
        <MilestoneAction {...p} />
      </div>
    </div>
  );
};

const MilestoneAction: React.SFC<MilestoneProps> = p => {
  if (!p.isCurrent || !p.isFunded || p.stage === MILESTONE_STAGE.PAID) {
    return null;
  }
  if (!p.hasArbiter && !p.isTeamMember) {
    return null;
  }

  // TEAM INFO
  const team = {
    [MILESTONE_STAGE.IDLE]: () => (
      <>
        <h3>Payment Request</h3>
        {p.immediatePayout && (
          <p>
            Congratulations on getting funded! You can now begin the process of receiving
            your initial payment. Click below to request the first milestone payout. It
            will instantly be approved, and you’ll receive your funds shortly thereafter.
          </p>
        )}
        {!p.immediatePayout &&
          p.index === 0 && (
            <p>
              Congratulations on getting funded! Click below to request your first
              milestone payout.
            </p>
          )}
        {!p.immediatePayout &&
          p.index > 0 && <p>You can request a payment for this milestone.</p>}
        <Button type="primary" onClick={() => p.requestPayout(p.proposalId, p.id)} block>
          {(p.immediatePayout && 'Request initial payout') || 'Request payout'}
        </Button>
      </>
    ),
    [MILESTONE_STAGE.REQUESTED]: () => (
      <>
        <h3>Payment Requested</h3>
        <p>
          The milestone payout was requested on {fmtDate(p.dateRequested)}. You will be
          notified when it has been reviewed.
        </p>
      </>
    ),
    [MILESTONE_STAGE.REJECTED]: () => (
      <>
        <h3>Payment Rejected</h3>
        <p>The request for payout was rejected for the following reason:</p>
        <q>{p.rejectReason}</q>
        <p>You may request payout again when you are ready.</p>
        <Button type="primary" onClick={() => p.requestPayout(p.proposalId, p.id)} block>
          Request payout
        </Button>
      </>
    ),
    [MILESTONE_STAGE.ACCEPTED]: () => (
      <>
        <h3>Awaiting Payment</h3>
        <p>
          Payout approved on {fmtDate(p.dateAccepted)}! You will receive payment shortly.
        </p>
      </>
    ),
    [MILESTONE_STAGE.PAID]: () => <></>,
  } as { [key in MILESTONE_STAGE]: () => ReactNode };

  // OUTSIDERS/OTHERS INFO
  const others = {
    [MILESTONE_STAGE.IDLE]: () => (
      <>
        <h3>Payment Request</h3>
        <p>The team may request a payout for this milestone at any time.</p>
      </>
    ),
    [MILESTONE_STAGE.REQUESTED]: () => (
      <>
        <h3>Payment Requested</h3>
        <p>
          The team requested a payout on {fmtDate(p.dateRequested)}, and awaits approval.
        </p>
      </>
    ),
    [MILESTONE_STAGE.REJECTED]: () => (
      <>
        <h3>Payment Rejected</h3>
        <p>
          The payout request was denied on {fmtDate(p.dateRejected)} for the following
          reason:
        </p>
        <q>{p.rejectReason}</q>
      </>
    ),
    [MILESTONE_STAGE.ACCEPTED]: () => (
      <>
        <h3>Awaiting Payment</h3>
        <p>The payout request was approved on {fmtDate(p.dateAccepted)}.</p>
      </>
    ),
    [MILESTONE_STAGE.PAID]: () => <></>,
  } as { [key in MILESTONE_STAGE]: () => ReactNode };

  // ARBITER INFO
  const arbiter = {
    [MILESTONE_STAGE.IDLE]: () => (
      <>
        <h3>Payment Request</h3>
        <p>
          The team may request a payout for this milestone at any time. As arbiter you
          will be responsible for reviewing these requests.
        </p>
      </>
    ),
    [MILESTONE_STAGE.REQUESTED]: () => (
      <>
        <h3>Payment Requested</h3>
        <p>
          The team requested a payout on {fmtDate(p.dateRequested)}, and awaits your
          approval.
        </p>
        <div className="ProposalMilestones-milestone-action-controls">
          <Button type="primary" onClick={() => p.acceptPayout(p.proposalId, p.id)}>
            Accept
          </Button>
          <Button type="danger" onClick={() => p.showRejectPayout(p.id)}>
            Reject
          </Button>
        </div>
      </>
    ),
    [MILESTONE_STAGE.REJECTED]: () => (
      <>
        <h3>Payment Rejected</h3>
        <p>
          You rejected this payment request on {fmtDate(p.dateRejected)} for the following
          reason:
        </p>
        <q>{p.rejectReason}</q>
      </>
    ),
    [MILESTONE_STAGE.ACCEPTED]: () => (
      <>
        <h3>Awaiting Payment</h3>
        <p>You approved this payment request on {fmtDate(p.dateAccepted)}.</p>
      </>
    ),
    [MILESTONE_STAGE.PAID]: () => <></>,
  } as { [key in MILESTONE_STAGE]: () => ReactNode };

  let content = null;
  if (p.isTeamMember) {
    content = team[p.stage]();
  } else if (p.isArbiter) {
    content = arbiter[p.stage]();
  } else {
    content = others[p.stage]();
  }

  // special warning if no arbiter is set for team members
  if (!p.hasArbiter && p.isTeamMember && p.stage === MILESTONE_STAGE.IDLE) {
    content = (
      <Alert
        type="info"
        message="Arbiter not assigned"
        description={
          <>
            <p>
              Arbiters are users who review requests for payment. When they have approved
              a payment the grant administrators are then notified to make payment.
            </p>
            <p>
              It typically takes a couple of days to have an arbiter assigned. Please{' '}
              <Link target="_blank" to="/contact">
                contact support
              </Link>{' '}
              if you have waited longer than three days.
            </p>
          </>
        }
      />
    );
  }

  return (
    <>
      <div className="ProposalMilestones-milestone-divider" />
      <div className="ProposalMilestones-milestone-action">{content}</div>
    </>
  );
};

const ConnectedProposalMilestones = connect<{}, DispatchProps, OwnProps, AppState>(
  undefined,
  {
    requestPayout: proposalActions.requestPayout,
    acceptPayout: proposalActions.acceptPayout,
    rejectPayout: proposalActions.rejectPayout,
  },
)(ProposalMilestones);

export default ConnectedProposalMilestones;
