import lodash from 'lodash';
import React from 'react';
import moment from 'moment';
import { Alert, Steps, Spin } from 'antd';
import { ProposalWithCrowdFund, MILESTONE_STATE } from 'modules/proposals/reducers';
import UnitDisplay from 'components/UnitDisplay';
import MilestoneAction from './MilestoneAction';
import { AppState } from 'store/reducers';
import { connect } from 'react-redux';
import classnames from 'classnames';
import './style.less';

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
  proposal: ProposalWithCrowdFund;
}

interface StateProps {
  accounts: AppState['web3']['accounts'];
}

type Props = OwnProps & StateProps;

interface State {
  step: number;
  activeMilestoneIdx: number;
  doTitlesOverflow: boolean;
}

class ProposalMilestones extends React.Component<Props, State> {
  stepTitleRefs: Array<React.RefObject<HTMLDivElement>>;
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
      return <Spin />;
    }
    const {
      milestones,
      crowdFund,
      crowdFund: { milestoneVotingPeriod, percentVotingForRefund },
    } = proposal;
    const { accounts } = this.props;

    const wasRefunded = percentVotingForRefund > 50;
    const isTrustee = crowdFund.trustees.includes(accounts[0]);
    const milestoneCount = milestones.length;

    const milestoneSteps = milestones.map((milestone, i) => {
      const status =
        this.state.activeMilestoneIdx === i && milestone.state === WAITING
          ? STEP_STATUS.PROCESS
          : milestoneStateToStepState[milestone.state];

      const className = this.state.step === i ? 'is-active' : 'is-inactive';
      const estimatedDate = moment(milestone.dateEstimated).format('MMMM YYYY');
      const reward = (
        <UnitDisplay value={milestone.amount} symbol="ETH" displayShortBalance={4} />
      );
      const approvalPeriod = milestone.isImmediatePayout
        ? 'Immediate'
        : moment.duration(milestoneVotingPeriod).humanize();
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
                    : `on ${moment(milestone.payoutRequestVoteDeadline).format(
                        'MMM Do, YYYY',
                      )}`}
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
              message={
                <span>
                  Payout vote is in progress! The approval period ends{' '}
                  {moment(milestone.payoutRequestVoteDeadline).from(new Date())}.
                </span>
              }
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
                  Payout was voted against on{' '}
                  {moment(milestone.payoutRequestVoteDeadline).format('MMM Do, YYYY')}.
                  {isTrustee ? ' You ' : ' The team '} can request another payout vote at
                  any time.
                </span>
              }
              style={alertStyle}
            />
          );
          break;
      }

      if (wasRefunded) {
        notification = (
          <Alert
            type="error"
            message={
              <span>A majority of the funders of this project voted for a refund.</span>
            }
            style={alertStyle}
          />
        );
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
          <div>
            Approval period: <strong>{approvalPeriod}</strong>
          </div>
        </div>
      );

      const Content = (
        <div className="ProposalMilestones-milestone">
          <div className="ProposalMilestones-milestone-body">
            <div className="ProposalMilestones-milestone-description">
              <h3 className="ProposalMilestones-milestone-title">{milestone.title}</h3>
              {statuses}
              {notification}
              {milestone.body}
            </div>
            {this.state.activeMilestoneIdx === i &&
              !wasRefunded && (
                <>
                  <div className="ProposalMilestones-milestone-divider" />
                  <div className="ProposalMilestones-milestone-action">
                    <MilestoneAction proposal={proposal} />
                  </div>
                </>
              )}
          </div>
        </div>
      );
      return { key: i, stepProps, Content };
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
        <Steps current={this.state.step} size={stepSize}>
          {milestoneSteps.map(mss => (
            <Steps.Step key={mss.key} {...mss.stepProps} />
          ))}
        </Steps>
        {milestoneSteps[this.state.step].Content}
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
    return activeMilestone.index;
  };

  private updateDoTitlesOverflow = () => {
    // hmr can sometimes muck up refs, let's make sure they all exist
    if (!this.stepTitleRefs.reduce((a, r) => !!r.current && a)) return;
    let doTitlesOverflow = false;
    const stepCount = this.stepTitleRefs.length;
    if (stepCount > 1) {
      // avoiding style calculation here by hardcoding antd icon width + padding + margin
      const iconWidths = stepCount * 56;
      const totalWidth = this.ref.current.clientWidth;
      const last = this.stepTitleRefs.slice(stepCount - 1).pop().current;
      // last title gets full space
      const lastWidth = last.clientWidth;
      const remainingWidth = totalWidth - (lastWidth + iconWidths);
      const remainingWidthSingle = remainingWidth / (stepCount - 1);
      // first titles have to share remaining space
      this.stepTitleRefs.slice(0, stepCount - 1).forEach(r => {
        doTitlesOverflow =
          doTitlesOverflow || r.current.clientWidth > remainingWidthSingle;
      });
    }
    this.setState({ doTitlesOverflow });
  };
}

const ConnectedProposalMilestones = connect((state: AppState) => ({
  accounts: state.web3.accounts,
}))(ProposalMilestones);

export default ConnectedProposalMilestones;
