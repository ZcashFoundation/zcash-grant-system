import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Steps, Icon, Spin, Alert } from 'antd';
import qs from 'query-string';
import { withRouter, RouteComponentProps } from 'react-router';
import { debounce } from 'underscore';
import Basics from './Basics';
import Team from './Team';
import Details from './Details';
import Milestones from './Milestones';
import Governance from './Governance';
import Review from './Review';
import Preview from './Preview';
import Final from './Final';
import createExampleProposal from './example';
import { createActions } from 'modules/create';
import { CreateFormState } from 'modules/create/types';
import { getCreateErrors } from 'modules/create/utils';
import { web3Actions } from 'modules/web3';
import { AppState } from 'store/reducers';
import { Web3RenderProps } from 'lib/Web3Container';

import './index.less';

export enum CREATE_STEP {
  BASICS = 'BASICS',
  TEAM = 'TEAM',
  DETAILS = 'DETAILS',
  MILESTONES = 'MILESTONES',
  GOVERNANCE = 'GOVERNANCE',
  REVIEW = 'REVIEW',
}

const STEP_ORDER = [
  CREATE_STEP.BASICS,
  CREATE_STEP.TEAM,
  CREATE_STEP.DETAILS,
  CREATE_STEP.MILESTONES,
  CREATE_STEP.GOVERNANCE,
  CREATE_STEP.REVIEW,
];

interface StepInfo {
  short: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  help: React.ReactNode;
  component: React.ComponentClass<any>;
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
      'Contributors are more willing to fund proposals with funding spread across multiple deadlines',
    component: Milestones,
  },
  [CREATE_STEP.GOVERNANCE]: {
    short: 'Governance',
    title: 'Choose how you get paid, and who’s in control',
    subtitle:
      'Everything here cannot be changed after publishing, so make sure it’s right',
    help:
      'Double check everything! This data powers the smart contract, and is immutable once it’s deployed.',
    component: Governance,
  },
  [CREATE_STEP.REVIEW]: {
    short: 'Review',
    title: 'Review your proposal',
    subtitle: 'Feel free to edit any field that doesn’t look right',
    help: 'You’ll get a chance to preview your proposal next before you publish it',
    component: Review,
  },
};

interface OwnProps {
  accounts: Web3RenderProps['accounts'];
}

interface StateProps {
  form: AppState['create']['form'];
  isSavingDraft: AppState['create']['isSavingDraft'];
  hasSavedDraft: AppState['create']['hasSavedDraft'];
  isFetchingDraft: AppState['create']['isFetchingDraft'];
  hasFetchedDraft: AppState['create']['hasFetchedDraft'];
}

interface DispatchProps {
  updateForm: typeof createActions['updateForm'];
  resetForm: typeof createActions['resetForm'];
  fetchDraft: typeof createActions['fetchDraft'];
  resetCreateCrowdFund: typeof web3Actions['resetCreateCrowdFund'];
}

type Props = OwnProps & StateProps & DispatchProps & RouteComponentProps<any>;

interface State {
  step: CREATE_STEP;
  isPreviewing: boolean;
  isPublishing: boolean;
  isExample: boolean;
}

class CreateFlow extends React.Component<Props, State> {
  private historyUnlisten: () => void;
  private debouncedUpdateForm: (form: Partial<CreateFormState>) => void;

  constructor(props: Props) {
    super(props);
    const searchValues = qs.parse(props.location.search);
    const step =
      searchValues.step && CREATE_STEP[searchValues.step]
        ? (CREATE_STEP[searchValues.step] as CREATE_STEP)
        : CREATE_STEP.BASICS;
    this.state = {
      step,
      isPreviewing: false,
      isPublishing: false,
      isExample: false,
    };
    this.debouncedUpdateForm = debounce(this.updateForm, 800);
  }

  componentDidMount() {
    this.props.resetCreateCrowdFund();
    this.props.fetchDraft();
    this.historyUnlisten = this.props.history.listen((location, action) => {
      if (action === 'POP') {
        const searchValues = qs.parse(location.search);
        const urlStep = searchValues.step && searchValues.step.toUpperCase();
        if (urlStep && CREATE_STEP[urlStep]) {
          this.setStep(urlStep as CREATE_STEP, true);
        } else {
          this.setStep(CREATE_STEP.BASICS, true);
        }
      }
    });
  }

  componentWillUnmount() {
    if (this.historyUnlisten) {
      this.historyUnlisten();
    }
  }

  render() {
    const { isFetchingDraft, isSavingDraft, hasFetchedDraft } = this.props;
    const { step, isPreviewing, isPublishing } = this.state;

    if (isFetchingDraft) {
      return (
        <div className="CreateFlow-loading">
          <Spin size="large" />
        </div>
      );
    }

    const info = STEP_INFO[step];
    const currentIndex = STEP_ORDER.indexOf(step);
    const isLastStep = STEP_ORDER.indexOf(step) === STEP_ORDER.length - 1;
    const StepComponent = info.component;

    let content;
    let showFooter = true;
    if (isPublishing) {
      content = <Final />;
      showFooter = false;
    } else if (isPreviewing) {
      content = <Preview />;
    } else {
      content = (
        <div className="CreateFlow">
          <div className="CreateFlow-header">
            <Steps current={currentIndex}>
              {STEP_ORDER.slice(0, 5).map(s => (
                <Steps.Step
                  key={s}
                  title={STEP_INFO[s].short}
                  onClick={() => this.setStep(s)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </Steps>
            {hasFetchedDraft && (
              <Alert
                style={{ margin: '2rem auto -2rem', maxWidth: '520px' }}
                type="success"
                closable
                message="Welcome back"
                description={
                  <span>
                    We've restored your state from before. If you want to start over,{' '}
                    <a onClick={this.props.resetForm}>click here</a>.
                  </span>
                }
              />
            )}
            <h1 className="CreateFlow-header-title">{info.title}</h1>
            <div className="CreateFlow-header-subtitle">{info.subtitle}</div>
          </div>
          <div className="CreateFlow-content">
            <StepComponent
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
                  key="publish"
                  onClick={this.startPublish}
                  disabled={this.checkFormErrors()}
                >
                  Publish
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
                  Continue <Icon type="right-circle-o" />
                </button>
              </>
            )}

            <button className="CreateFlow-footer-example" onClick={this.fillInExample}>
              <Icon type="fast-forward" />
            </button>
          </div>
        )}
        {isSavingDraft && (
          <div className="CreateFlow-draftNotification">Saving draft...</div>
        )}
      </div>
    );
  }

  private updateForm = (form: Partial<CreateFormState>) => {
    this.props.updateForm(form);
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

  private startPublish = () => {
    this.setState({ isPublishing: true });
  };

  private checkFormErrors = () => {
    const errors = getCreateErrors(this.props.form);
    return !!Object.keys(errors).length;
  };

  private fillInExample = () => {
    const { accounts } = this.props;
    const [payoutAddress, ...trustees] = accounts;

    this.updateForm(createExampleProposal(payoutAddress, trustees || []));
    setTimeout(() => {
      this.setState({
        isExample: true,
        step: CREATE_STEP.REVIEW,
      });
    }, 50);
  };
}

const withConnect = connect<StateProps, DispatchProps, OwnProps, AppState>(
  (state: AppState) => ({
    form: state.create.form,
    isSavingDraft: state.create.isSavingDraft,
    hasSavedDraft: state.create.hasSavedDraft,
    isFetchingDraft: state.create.isFetchingDraft,
    hasFetchedDraft: state.create.hasFetchedDraft,
    crowdFundLoading: state.web3.crowdFundLoading,
    crowdFundError: state.web3.crowdFundError,
    crowdFundCreatedAddress: state.web3.crowdFundCreatedAddress,
  }),
  {
    updateForm: createActions.updateForm,
    resetForm: createActions.resetForm,
    fetchDraft: createActions.fetchDraft,
    resetCreateCrowdFund: web3Actions.resetCreateCrowdFund,
  },
);

export default compose<Props, OwnProps>(
  withRouter,
  withConnect,
)(CreateFlow);
