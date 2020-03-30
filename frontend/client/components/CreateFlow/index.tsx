import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Steps, Icon } from 'antd';
import qs from 'query-string';
import { withRouter, RouteComponentProps } from 'react-router';
import { History } from 'history';
import { debounce } from 'underscore';
import { isEqual } from 'lodash';
import Basics from './Basics';
import Team from './Team';
import Details from './Details';
import Milestones from './Milestones';
import Payment from './Payment';
import Review from './Review';
import Preview from './Preview';
import Final from './Final';
import Explainer from './Explainer';
import SubmitWarningModal from './SubmitWarningModal';
import createExampleProposal from './example';
import { createActions } from 'modules/create';
import { ProposalDraft } from 'types';
import { getCreateErrors } from 'modules/create/utils';
import ls from 'local-storage';
import { getProposalInvites } from 'api/api';

import { AppState } from 'store/reducers';

import './index.less';

export enum CREATE_STEP {
  BASICS = 'BASICS',
  TEAM = 'TEAM',
  DETAILS = 'DETAILS',
  MILESTONES = 'MILESTONES',
  PAYMENT = 'PAYMENT',
  REVIEW = 'REVIEW',
}

const STEP_ORDER = [
  CREATE_STEP.BASICS,
  CREATE_STEP.TEAM,
  CREATE_STEP.DETAILS,
  CREATE_STEP.MILESTONES,
  CREATE_STEP.PAYMENT,
  CREATE_STEP.REVIEW,
];

interface StepInfo {
  short: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  help: React.ReactNode;
  component: any;
}

interface LSExplainer {
  noExplain: boolean;
}

const STEP_INFO: { [key in CREATE_STEP]: StepInfo } = {
  [CREATE_STEP.BASICS]: {
    short: 'Basics',
    title: 'Let’s start with the basics',
    subtitle: 'Don’t worry, you can come back and change things before publishing',
    help:
      'You don’t have to fill out everything at once right now, you can come back later.',
    component: Basics,
  },
  [CREATE_STEP.TEAM]: {
    short: 'Team',
    title: 'Assemble your team',
    subtitle: 'Let everyone know if you’re flying solo, or who you’re working with',
    help:
      'More team members, real names, and linked social accounts adds legitimacy to your proposal',
    component: Team,
  },
  [CREATE_STEP.DETAILS]: {
    short: 'Details',
    title: 'Dive into the details',
    subtitle: 'Here’s your chance to lay out the full proposal, in all its glory',
    help:
      'Make sure people know what you’re building, why you’re qualified, and where the money’s going',
    component: Details,
  },
  [CREATE_STEP.MILESTONES]: {
    short: 'Milestones',
    title: 'Set up milestones for deliverables',
    subtitle: 'Make a timeline of when you’ll complete tasks, and receive funds',
    help:
      'Contributors are more willing to fund proposals with funding spread across multiple milestones',
    component: Milestones,
  },
  [CREATE_STEP.PAYMENT]: {
    short: 'Payment',
    title: 'Set your payout and tip addresses',
    subtitle: '',
    help:
      'Double check your addresses, and make sure they’re secure. Once sent, transactions are irreversible!',
    component: Payment,
  },
  [CREATE_STEP.REVIEW]: {
    short: 'Review',
    title: 'Review your proposal',
    subtitle: 'Feel free to edit any field that doesn’t look right',
    help: 'You’ll get a chance to preview your proposal next before you publish it',
    component: Review,
  },
};

interface StateProps {
  form: AppState['create']['form'];
  isSavingDraft: AppState['create']['isSavingDraft'];
  hasSavedDraft: AppState['create']['hasSavedDraft'];
  saveDraftError: AppState['create']['saveDraftError'];
}

interface DispatchProps {
  updateForm: typeof createActions['updateForm'];
}

type Props = StateProps & DispatchProps & RouteComponentProps<any>;

interface State {
  step: CREATE_STEP;
  isPreviewing: boolean;
  isShowingSubmitWarning: boolean;
  isSubmitting: boolean;
  isExplaining: boolean;
  isExample: boolean;
  isPolling: boolean;
}

const TEAM_CHANGE_POLL_INTERVAL = 5000;

class CreateFlow extends React.Component<Props, State> {
  private historyUnlisten: () => void;
  private debouncedUpdateForm: (form: Partial<ProposalDraft>) => void;
  private pollInterval: ReturnType<typeof setInterval> | undefined;

  constructor(props: Props) {
    super(props);
    const searchValues = qs.parse(props.location.search);
    const queryStep = searchValues.step ? searchValues.step.toUpperCase() : null;
    const step =
      queryStep && CREATE_STEP[queryStep]
        ? (CREATE_STEP[queryStep] as CREATE_STEP)
        : CREATE_STEP.BASICS;
    const noExplain = !!ls<LSExplainer>('noExplain');

    this.state = {
      step,
      isPreviewing: false,
      isSubmitting: false,
      isExample: false,
      isShowingSubmitWarning: false,
      isExplaining: !noExplain,
      isPolling: false,
    };
    this.debouncedUpdateForm = debounce(this.updateForm, 800);
    this.historyUnlisten = this.props.history.listen(this.handlePop);
  }

  componentWillMount() {
    if (!this.pollInterval) {
      this.pollInterval = setInterval(this.pollForTeamChanges, TEAM_CHANGE_POLL_INTERVAL);
    }
  }

  componentWillUnmount() {
    if (this.historyUnlisten) {
      this.historyUnlisten();
    }

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = undefined;
    }
  }

  render() {
    const { isSavingDraft, saveDraftError } = this.props;
    const {
      step,
      isPreviewing,
      isSubmitting,
      isShowingSubmitWarning,
      isExplaining,
    } = this.state;

    const info = STEP_INFO[step];
    const currentIndex = STEP_ORDER.indexOf(step);
    const isLastStep = currentIndex === STEP_ORDER.length - 1;
    const isSecondToLastStep = currentIndex === STEP_ORDER.length - 2;
    const StepComponent = info.component;

    let content;
    let showFooter = true;
    if (isSubmitting) {
      content = <Final goBack={this.cancelSubmit} />;
      showFooter = false;
    } else if (isPreviewing) {
      content = <Preview />;
    } else if (isExplaining) {
      content = <Explainer startSteps={this.startSteps} />;
      showFooter = false;
    } else {
      // Antd definitions are missing `onClick` for step, even though it works.
      const Step = Steps.Step as any;
      content = (
        <div className="CreateFlow">
          <div className="CreateFlow-header">
            <Steps current={currentIndex}>
              {STEP_ORDER.map(s => (
                <Step
                  key={s}
                  title={STEP_INFO[s].short}
                  onClick={() => this.setStep(s)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </Steps>
            <h1 className="CreateFlow-header-title">{info.title}</h1>
            <div className="CreateFlow-header-subtitle">{info.subtitle}</div>
          </div>
          <div className="CreateFlow-content">
            <StepComponent
              proposalId={this.props.form && this.props.form.proposalId}
              initialState={this.props.form}
              updateForm={this.debouncedUpdateForm}
              setStep={this.setStep}
            />
          </div>
        </div>
      );
    }

    return (
      <div>
        {content}
        {showFooter && (
          <div className="CreateFlow-footer">
            {isLastStep ? (
              <>
                <button
                  className="CreateFlow-footer-button"
                  key="preview"
                  onClick={this.togglePreview}
                >
                  {isPreviewing ? 'Back to Edit' : 'Preview'}
                </button>
                <button
                  className="CreateFlow-footer-button is-primary"
                  key="submit"
                  onClick={this.openPublishWarning}
                  disabled={this.checkFormErrors()}
                >
                  Submit
                </button>
              </>
            ) : (
              <>
                <div className="CreateFlow-footer-help">{info.help}</div>
                <button
                  className="CreateFlow-footer-button"
                  key="next"
                  onClick={this.nextStep}
                >
                  {isSecondToLastStep ? 'Review' : 'Continue'}{' '}
                  <Icon type="right-circle-o" />
                </button>
              </>
            )}

            {process.env.NODE_ENV !== 'production' && (
              <button className="CreateFlow-footer-example" onClick={this.fillInExample}>
                <Icon type="fast-forward" />
              </button>
            )}
          </div>
        )}
        {isSavingDraft ? (
          <div className="CreateFlow-draftNotification">Saving draft...</div>
        ) : (
          saveDraftError && (
            <div className="CreateFlow-draftNotification is-error">
              Failed to save draft!
              <br />
              {saveDraftError}
            </div>
          )
        )}
        <SubmitWarningModal
          proposal={this.props.form}
          isVisible={isShowingSubmitWarning}
          handleClose={this.closePublishWarning}
          handleSubmit={this.startSubmit}
        />
      </div>
    );
  }

  private updateForm = (form: Partial<ProposalDraft>) => {
    this.props.updateForm(form);
  };

  private startSteps = () => {
    this.setState({ step: CREATE_STEP.BASICS, isExplaining: false });
  };

  private setStep = (step: CREATE_STEP, skipHistory?: boolean) => {
    this.setState({ step });
    if (!skipHistory) {
      const { history, location } = this.props;
      history.push(`${location.pathname}?step=${step.toLowerCase()}`);
    }
  };

  private nextStep = () => {
    const idx = STEP_ORDER.indexOf(this.state.step);
    if (idx !== STEP_ORDER.length - 1) {
      this.setStep(STEP_ORDER[idx + 1]);
    }
  };

  private togglePreview = () => {
    this.setState({ isPreviewing: !this.state.isPreviewing });
  };

  private startSubmit = () => {
    this.setState({
      isSubmitting: true,
      isShowingSubmitWarning: false,
    });
  };

  private checkFormErrors = () => {
    if (!this.props.form) {
      return true;
    }
    const errors = getCreateErrors(this.props.form);
    return !!Object.keys(errors).length;
  };

  private handlePop: History.LocationListener = (location, action) => {
    if (action === 'POP') {
      this.setState({ isPreviewing: false });
      const searchValues = qs.parse(location.search);
      const urlStep = searchValues.step && searchValues.step.toUpperCase();
      if (urlStep && CREATE_STEP[urlStep]) {
        this.setStep(urlStep as CREATE_STEP, true);
      } else {
        this.setStep(CREATE_STEP.BASICS, true);
      }
    }
  };

  private openPublishWarning = async () => {
    this.setState({ isShowingSubmitWarning: true });
  };

  private closePublishWarning = () => {
    this.setState({ isShowingSubmitWarning: false });
  };

  private cancelSubmit = () => {
    this.setState({ isSubmitting: false });
  };

  private fillInExample = () => {
    this.updateForm(createExampleProposal());
    setTimeout(() => {
      this.setState({
        isExample: true,
        step: CREATE_STEP.REVIEW,
      });
    }, 50);
  };

  private pollForTeamChanges = async () => {
    const { form } = this.props;

    if (this.state.isPolling) return;
    if (form) {
      this.setState({ isPolling: true });
      try {
        const {
          data: { invites, team },
        } = await getProposalInvites(form.proposalId);

        if (!isEqual(form.invites, invites) || !isEqual(form.team, team)) {
          this.updateForm({ invites, team });
        }
        // tslint:disable-next-line:no-empty
      } catch {}
      this.setState({ isPolling: false });
    }
  };
}

const withConnect = connect<StateProps, DispatchProps, {}, AppState>(
  (state: AppState) => ({
    form: state.create.form,
    isSavingDraft: state.create.isSavingDraft,
    hasSavedDraft: state.create.hasSavedDraft,
    saveDraftError: state.create.saveDraftError,
  }),
  {
    updateForm: createActions.updateForm,
  },
);

export default compose<Props, {}>(
  withRouter,
  withConnect,
)(CreateFlow);
