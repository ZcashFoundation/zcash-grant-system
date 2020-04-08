import React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'antd';
import { Link } from 'react-router-dom';
import Loader from 'components/Loader';
import { createActions } from 'modules/create';
import { AppState } from 'store/reducers';
import './Final.less';
import { STATUS } from 'types';

interface OwnProps {
  goBack(): void;
}

interface StateProps {
  form: AppState['create']['form'];
  submittedProposal: AppState['create']['submittedProposal'];
  submitError: AppState['create']['submitError'];
  submittedLiveDraft: AppState['create']['submittedLiveDraft'];
  submitErrorLiveDraft: AppState['create']['submitErrorLiveDraft'];
}

interface DispatchProps {
  submitProposal: typeof createActions['submitProposal'];
  submitLiveDraft: typeof createActions['submitLiveDraft'];
}

type Props = OwnProps & StateProps & DispatchProps;

class CreateFinal extends React.Component<Props, {}> {
  componentDidMount() {
    this.submit();
  }

  render() {
    const {
      submittedProposal,
      submittedLiveDraft,
      submitError,
      submitErrorLiveDraft,
      goBack,
      form,
    } = this.props;

    const isLiveDraft = form && form.status === STATUS.LIVE_DRAFT;
    const error = isLiveDraft ? submitErrorLiveDraft : submitError;
    const ready = isLiveDraft ? submittedLiveDraft : submittedProposal;

    const updatedId = submittedLiveDraft ? submittedLiveDraft.proposalId : '';

    let content;
    if (error) {
      content = (
        <div className="CreateFinal-message is-error">
          <Icon type="close-circle" />
          <div className="CreateFinal-message-text">
            <h3>
              <b>Something went wrong during {isLiveDraft ? 'updating' : 'creation'}</b>
            </h3>
            <h5>{submitError}</h5>
            <a onClick={goBack}>Click here</a> to go back to the form and try again.
          </div>
        </div>
      );
    } else if (ready) {
      content = (
        <>
          <div className="CreateFinal-message is-success">
            <Icon type="check-circle" />
            <div className="CreateFinal-message-text">
              {isLiveDraft ? (
                <>
                  Your proposal has been updated!{' '}
                  <Link to={`/proposals/${updatedId}`}>Click here</Link> to see it live.
                </>
              ) : (
                <>
                  Your proposal has been submitted! Check your{' '}
                  <Link to={`/profile?tab=pending`}>profile's pending tab</Link> to check
                  its status.
                </>
              )}
            </div>
          </div>
        </>
      );
    } else {
      content = <Loader size="large" tip="Submitting your proposal..." />;
    }

    return <div className="CreateFinal">{content}</div>;
  }

  private submit = () => {
    const { form } = this.props;
    if (form) {
      if (form.status === STATUS.LIVE_DRAFT) {
        this.props.submitLiveDraft(form);
      } else {
        this.props.submitProposal(form);
      }
    }
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  (state: AppState) => ({
    form: state.create.form,
    submittedProposal: state.create.submittedProposal,
    submitError: state.create.submitError,
    submittedLiveDraft: state.create.submittedLiveDraft,
    submitErrorLiveDraft: state.create.submitErrorLiveDraft,
  }),
  {
    submitProposal: createActions.submitProposal,
    submitLiveDraft: createActions.submitLiveDraft,
  },
)(CreateFinal);
