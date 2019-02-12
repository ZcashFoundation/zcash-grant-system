import { throttle } from 'lodash';
import React, { ReactNode } from 'react';
import moment from 'moment';
import { Alert, Steps, Button, message } from 'antd';
import { Milestone, ProposalMilestone, MILESTONE_STAGE } from 'types';
import UnitDisplay from 'components/UnitDisplay';
import Loader from 'components/Loader';
import { AppState } from 'store/reducers';
import { connect } from 'react-redux';
import classnames from 'classnames';
import Placeholder from 'components/Placeholder';
import { AlertProps } from 'antd/lib/alert';
import { StepProps } from 'antd/lib/steps';
import { proposalActions } from 'modules/proposals';
import './index.less';
import { ProposalDetail } from 'modules/proposals/reducers';

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
  (n && moment(n * 1000).format('MMM Do, YYYY')) || undefined;

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
}

class ProposalMilestones extends React.Component<Props, State> {
  stepTitleRefs: Array<React.RefObject<HTMLDivElement>> = [];
  ref: React.RefObject<HTMLDivElement>;
  throttledUpdateDoTitlesOverflow: () => void;
  constructor(props: Props) {
    super(props);
    this.stepTitleRefs = this.props.proposal.milestones.map(() => React.createRef());
    this.ref = React.createRef();
    this.throttledUpdateDoTitlesOverflow = throttle(this.updateDoTitlesOverflow, 500);
    this.state = {
      step: 0,
      activeMilestoneIdx: 0,
      doTitlesOverflow: true,
    };
  }

  componentDidMount() {
    if (this.props.proposal) {
      const { currentMilestone } = this.props.proposal;
      this.setState({ step: (currentMilestone && currentMilestone.index) || 0 });
    }
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
      acceptPayoutError,
      rejectPayoutError,
    } = this.props.proposal;
    if (!prevProps.proposal.requestPayoutError && requestPayoutError) {
      message.error(requestPayoutError);
    }
    if (!prevProps.proposal.acceptPayoutError && acceptPayoutError) {
      message.error(acceptPayoutError);
    }
    if (!prevProps.proposal.rejectPayoutError && rejectPayoutError) {
      message.error(rejectPayoutError);
    }
  }

  render() {
    const { proposal, requestPayout, acceptPayout, rejectPayout } = this.props;
    if (!proposal) {
      return <Loader />;
    }
    const { milestones, currentMilestone } = proposal;
    const milestoneCount = milestones.length;
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
    const activeIsCurrent = activeMilestone.id === proposal.currentMilestone!.id;

    return (
      <div
        ref={this.ref}
        className={classnames({
          ['ProposalMilestones']: true,
          ['do-titles-overflow']: this.state.doTitlesOverflow,
        })}
      >
        {!!milestoneSteps.length ? (
          <>
            <Steps current={this.state.step} size={stepSize}>
              {milestoneSteps.map(mss => (
                <Steps.Step key={mss.key} {...mss.stepProps} />
              ))}
            </Steps>
            <Milestone
              proposalId={proposal.proposalId}
              {...{ requestPayout, acceptPayout, rejectPayout }}
              {...activeMilestone}
              isCurrent={activeIsCurrent}
              isTeamMember={proposal.isTeamMember || false}
              isArbiter={proposal.isArbiter || false}
            />
          </>
        ) : (
          <Placeholder
            title="No milestones"
            subtitle="The creator of this proposal has not setup any milestones"
          />
        )}
      </div>
    );
  }

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
  isTeamMember: boolean;
  isArbiter: boolean;
  isCurrent: boolean;
  proposalId: number;
}
const Milestone: React.SFC<MilestoneProps> = p => {
  const estimatedDate = moment(p.dateEstimated * 1000).format('MMMM YYYY');
  const reward = <UnitDisplay value={p.amount} symbol="ZEC" displayShortBalance={4} />;
  const getAlertProps = {
    [MILESTONE_STAGE.IDLE]: () => null,
    [MILESTONE_STAGE.REQUESTED]: () => ({
      type: 'info',
      message: (
        <>
          The team has requested a payout for this milestone. It is currently under
          review.
        </>
      ),
    }),
    [MILESTONE_STAGE.REJECTED]: () => ({
      type: 'warning',
      message: (
        <span>
          Payout for this milestone was rejected on {fmtDate(p.dateRejected)}.
          {p.isTeamMember ? ' You ' : ' The team '} can request another review for payout
          at any time.
        </span>
      ),
    }),
    [MILESTONE_STAGE.ACCEPTED]: () => ({
      type: 'info',
      message: (
        <span>
          Payout for this milestone was accepted on {fmtDate(p.dateAccepted)}.
          <strong>{reward}</strong> will be sent to{' '}
          {p.isTeamMember ? ' you ' : ' the team '} soon.
        </span>
      ),
    }),
    [MILESTONE_STAGE.PAID]: () => ({
      type: 'success',
      message: (
        <span>
          The team was awarded <strong>{reward}</strong>{' '}
          {p.immediatePayout && ` as an initial payout `} on ${fmtDate(p.datePaid)}
          `.
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
  if (!p.isCurrent) {
    return null;
  }

  const team = {
    [MILESTONE_STAGE.IDLE]: () => (
      <>
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
        <Button type="primary" onClick={() => p.requestPayout(p.proposalId, p.id)}>
          {(p.immediatePayout && 'Request initial payout') || 'Request payout'}
        </Button>
      </>
    ),
    [MILESTONE_STAGE.REQUESTED]: () => (
      <p>
        The milestone payout was requested on {fmtDate(p.dateRequested)}. You will be
        notified when it has been reviewed.
      </p>
    ),
    [MILESTONE_STAGE.REJECTED]: () => (
      <>
        <p>
          The request for payout was rejected for the following reason:
          <q>{p.rejectReason}</q>
          You may request payout again when you are ready.
        </p>
        <Button type="primary" onClick={() => p.requestPayout(p.proposalId, p.id)}>
          Request payout
        </Button>
      </>
    ),
    [MILESTONE_STAGE.ACCEPTED]: () => (
      <p>
        Payout approved on {fmtDate(p.dateAccepted)}! You will receive payment shortly.
      </p>
    ),
    [MILESTONE_STAGE.PAID]: () => <></>,
  } as { [key in MILESTONE_STAGE]: () => ReactNode };

  const others = {
    [MILESTONE_STAGE.IDLE]: () => (
      <p>The team may request a payout for this milestone at any time.</p>
    ),
    [MILESTONE_STAGE.REQUESTED]: () => (
      <p>
        The team requested a payout on {fmtDate(p.dateRequested)}, and awaits approval.
      </p>
    ),
    [MILESTONE_STAGE.REJECTED]: () => (
      <p>
        The payout request was denied on {fmtDate(p.dateRejected)} for the following
        reason:
        <q>{p.rejectReason}</q>
      </p>
    ),
    [MILESTONE_STAGE.ACCEPTED]: () => (
      <>The payout request was approved on {fmtDate(p.dateAccepted)}.</>
    ),
    [MILESTONE_STAGE.PAID]: () => <></>,
  } as { [key in MILESTONE_STAGE]: () => ReactNode };

  const arbiter = {
    [MILESTONE_STAGE.IDLE]: () => (
      <p>
        The team may request a payout for this milestone at any time. As arbiter you will
        be responsible for reviewing these requests.
      </p>
    ),
    [MILESTONE_STAGE.REQUESTED]: () => (
      <>
        <p>
          The team requested a payout on {fmtDate(p.dateRequested)}, and awaits your
          approval.
        </p>
        <Button type="primary" onClick={() => p.acceptPayout(p.proposalId, p.id)}>
          Accept
        </Button>
        <Button
          type="danger"
          onClick={() =>
            p.rejectPayout(p.proposalId, p.id, 'Test reason. (TODO: modal w/ text input)')
          }
        >
          Reject
        </Button>
      </>
    ),
    [MILESTONE_STAGE.REJECTED]: () => (
      <p>
        The payout request was denied on {fmtDate(p.dateRejected)} for the following
        reason:
        <q>{p.rejectReason}</q>
      </p>
    ),
    [MILESTONE_STAGE.ACCEPTED]: () => (
      <>The payout request was approved on {fmtDate(p.dateAccepted)}.</>
    ),
    [MILESTONE_STAGE.PAID]: () => <></>,
  } as { [key in MILESTONE_STAGE]: () => ReactNode };

  let content: ReactNode = null;
  if (p.isTeamMember) {
    content = team[p.stage]();
  } else if (p.isArbiter) {
    content = arbiter[p.stage]();
  } else {
    content = others[p.stage]();
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
