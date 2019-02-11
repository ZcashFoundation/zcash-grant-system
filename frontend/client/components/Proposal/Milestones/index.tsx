import lodash from 'lodash';
import React from 'react';
import moment from 'moment';
import { Alert, Steps } from 'antd';
import { Proposal, Milestone, ProposalMilestone, MILESTONE_STAGE } from 'types';
import UnitDisplay from 'components/UnitDisplay';
import Loader from 'components/Loader';
import { AppState } from 'store/reducers';
import { connect } from 'react-redux';
import classnames from 'classnames';
import './style.less';
import Placeholder from 'components/Placeholder';
import { AlertProps } from 'antd/lib/alert';
import { StepProps } from 'antd/lib/steps';

// const { WAITING, ACTIVE, PAID, REJECTED } = MILESTONE_STATE;

// enum STEP_STATUS {
//   WAIT = 'wait',
//   PROCESS = 'process',
//   FINISH = 'finish',
//   ERROR = 'error',
// }

// const milestoneStateToStepState = {
//   [WAITING]: STEP_STATUS.WAIT,
//   [ACTIVE]: STEP_STATUS.PROCESS,
//   [PAID]: STEP_STATUS.FINISH,
//   [REJECTED]: STEP_STATUS.ERROR,
// };

interface OwnProps {
  proposal: Proposal;
}

interface StateProps {
  accounts: string[];
}

type Props = OwnProps & StateProps;

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
    this.throttledUpdateDoTitlesOverflow = lodash.throttle(
      this.updateDoTitlesOverflow,
      500,
    );
    this.state = {
      step: 0,
      activeMilestoneIdx: 0,
      doTitlesOverflow: true,
    };
  }

  componentDidMount() {
    if (this.props.proposal) {
      const activeMilestoneIdx = this.getActiveMilestoneIdx();
      this.setState({ step: activeMilestoneIdx, activeMilestoneIdx });
    }
    this.updateDoTitlesOverflow();
    window.addEventListener('resize', this.throttledUpdateDoTitlesOverflow);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.throttledUpdateDoTitlesOverflow);
  }

  componentDidUpdate(_: Props, prevState: State) {
    const activeMilestoneIdx = this.getActiveMilestoneIdx();
    if (prevState.activeMilestoneIdx !== activeMilestoneIdx) {
      this.setState({ step: activeMilestoneIdx, activeMilestoneIdx });
    }
  }

  render() {
    const { proposal } = this.props;
    if (!proposal) {
      return <Loader />;
    }
    const { milestones } = proposal;
    const milestoneCount = milestones.length;
    const milestoneSteps = milestones.map((milestone, i) => {
      const status: StepProps['status'] = 'wait';
      // this.state.activeMilestoneIdx === i && milestone.state === WAITING
      //   ? STEP_STATUS.PROCESS
      //   : milestoneStateToStepState[milestone.state];
      const className = this.state.step === i ? 'is-active' : 'is-inactive';
      const stepProps = {
        title: <div ref={this.stepTitleRefs[i]}>{milestone.title}</div>,
        status,
        className,
        onClick: () => this.setState({ step: i }),
      };
      return { key: i, stepProps };
    });

    const stepSize = milestoneCount > 5 ? 'small' : 'default';

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
              {...proposal.milestones[this.state.step]}
              isTeamMember={proposal.isTeamMember || false}
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

  private getActiveMilestoneIdx = () => {
    return 0;
    // const { milestones } = this.props.proposal;
    // const activeMilestone =
    //   milestones.find(
    //     m =>
    //       m.state === WAITING ||
    //       m.state === ACTIVE ||
    //       (m.state === PAID && !m.isPaid) ||
    //       m.state === REJECTED,
    //   ) || milestones[0];
    // return milestones.indexOf(activeMilestone);
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

const Milestone: React.SFC<ProposalMilestone & { isTeamMember: boolean }> = p => {
  const estimatedDate = moment(p.dateEstimated * 1000).format('MMMM YYYY');
  const reward = <UnitDisplay value={p.amount} symbol="ZEC" displayShortBalance={4} />;
  const fmtDate = (n: undefined | number) =>
    (n && moment(n * 1000).format('MMM Do, YYYY')) || undefined;
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
      </div>
    </div>
  );
};

const ConnectedProposalMilestones = connect((state: AppState) => {
  console.warn('TODO - new redux accounts/user-role-for-proposal', state);
  return {
    accounts: [],
  };
})(ProposalMilestones);

export default ConnectedProposalMilestones;
