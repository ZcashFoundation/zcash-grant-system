import lodash from 'lodash';
import React from 'react';
import moment from 'moment';
import { Alert, Steps } from 'antd';
import { Proposal, MILESTONE_STATE } from 'types';
import UnitDisplay from 'components/UnitDisplay';
import Loader from 'components/Loader';
import { AppState } from 'store/reducers';
import { connect } from 'react-redux';
import classnames from 'classnames';
import './style.less';
import Placeholder from 'components/Placeholder';

const { WAITING, ACTIVE, PAID, REJECTED } = MILESTONE_STATE;

enum STEP_STATUS {
  WAIT = 'wait',
  PROCESS = 'process',
  FINISH = 'finish',
  ERROR = 'error',
}

const milestoneStateToStepState = {
  [WAITING]: STEP_STATUS.WAIT,
  [ACTIVE]: STEP_STATUS.PROCESS,
  [PAID]: STEP_STATUS.FINISH,
  [REJECTED]: STEP_STATUS.ERROR,
};

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

    const isTrustee = false; // TODO: Replace with being on the team
    const milestoneCount = milestones.length;

    const milestoneSteps = milestones.map((milestone, i) => {
      const status =
        this.state.activeMilestoneIdx === i && milestone.state === WAITING
          ? STEP_STATUS.PROCESS
          : milestoneStateToStepState[milestone.state];

      const className = this.state.step === i ? 'is-active' : 'is-inactive';
      const estimatedDate = moment(milestone.dateEstimated).format('MMMM YYYY');
      const reward = (
        <UnitDisplay value={milestone.amount} symbol="ZEC" displayShortBalance={4} />
      );
      const alertStyle = { width: 'fit-content', margin: '0 0 1rem 0' };

      const stepProps = {
        title: <div ref={this.stepTitleRefs[i]}>{milestone.title}</div>,
        status,
        className,
        onClick: () => this.setState({ step: i }),
      };

      let notification;

      switch (milestone.state) {
        case PAID:
          notification = (
            <Alert
              type="success"
              message={
                <span>
                  The team was awarded <strong>{reward}</strong>{' '}
                  {milestone.isImmediatePayout
                    ? 'as an initial payout'
                    : // TODO: Add property for payout date on milestones
                      `on ${moment().format('MMM Do, YYYY')}`}
                  .
                </span>
              }
              style={alertStyle}
            />
          );
          break;
        case ACTIVE:
          notification = (
            <Alert
              type="info"
              message={`
                The team has requested a payout for this milestone. It is
                currently under review.
              `}
              style={alertStyle}
            />
          );
          break;
        case REJECTED:
          notification = (
            <Alert
              type="warning"
              message={
                <span>
                  Payout for this milestone was rejected on{' '}
                  {/* TODO: add property for payout rejection date on milestones */}
                  {moment().format('MMM Do, YYYY')}.{isTrustee ? ' You ' : ' The team '}{' '}
                  can request another review for payout at any time.
                </span>
              }
              style={alertStyle}
            />
          );
          break;
      }

      const statuses = (
        <div className="ProposalMilestones-milestone-status">
          {!milestone.isImmediatePayout && (
            <div>
              Estimate: <strong>{estimatedDate}</strong>
            </div>
          )}
          <div>
            Reward: <strong>{reward}</strong>
          </div>
        </div>
      );

      const content = (
        <div className="ProposalMilestones-milestone">
          <div className="ProposalMilestones-milestone-body">
            <div className="ProposalMilestones-milestone-description">
              <h3 className="ProposalMilestones-milestone-title">{milestone.title}</h3>
              {statuses}
              {notification}
              {milestone.content}
            </div>
          </div>
        </div>
      );
      return { key: i, stepProps, content };
    });

    const stepSize = milestoneCount > 5 ? 'small' : 'default';

    return (
      <div
        ref={this.ref}
        className={classnames({
          ['ProposalMilestones']: true,
          ['do-titles-overflow']: this.state.doTitlesOverflow,
          [`is-count-${milestoneCount}`]: true,
        })}
      >
        {!!milestoneSteps.length ? (
          <>
            <Steps current={this.state.step} size={stepSize}>
              {milestoneSteps.map(mss => (
                <Steps.Step key={mss.key} {...mss.stepProps} />
              ))}
            </Steps>
            {milestoneSteps[this.state.step].content}
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
    const { milestones } = this.props.proposal;
    const activeMilestone =
      milestones.find(
        m =>
          m.state === WAITING ||
          m.state === ACTIVE ||
          (m.state === PAID && !m.isPaid) ||
          m.state === REJECTED,
      ) || milestones[0];
    return milestones.indexOf(activeMilestone);
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

const ConnectedProposalMilestones = connect((state: AppState) => {
  console.warn('TODO - new redux accounts/user-role-for-proposal', state);
  return {
    accounts: [],
  };
})(ProposalMilestones);

export default ConnectedProposalMilestones;
