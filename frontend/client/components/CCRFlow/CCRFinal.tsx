import React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'antd';
import { Link } from 'react-router-dom';
import Loader from 'components/Loader';
import { ccrActions } from 'modules/ccr';
import { AppState } from 'store/reducers';
import './CCRFinal.less';

interface OwnProps {
  goBack(): void;
}

interface StateProps {
  form: AppState['ccr']['form'];
  submittedCCR: AppState['ccr']['submittedCCR'];
  submitError: AppState['ccr']['submitError'];
}

interface DispatchProps {
  submitCCR: typeof ccrActions['submitCCR'];
}

type Props = OwnProps & StateProps & DispatchProps;

class CCRFinal extends React.Component<Props, {}> {
  componentDidMount() {
    this.submit();
  }

  render() {
    const { submittedCCR, submitError, goBack } = this.props;
    const ready = submittedCCR;

    let content;
    if (submitError) {
      content = (
        <div className="CCRFinal-message is-error">
          <Icon type="close-circle" />
          <div className="CCRFinal-message-text">
            <h3>
              <b>Something went wrong during creation</b>
            </h3>
            <h5>{submitError}</h5>
            <a onClick={goBack}>Click here</a> to go back to the form and try again.
          </div>
        </div>
      );
    } else if (ready) {
      content = (
        <>
          <div className="CCRFinal-message is-success">
            <Icon type="check-circle" />

            <div className="CCRFinal-message-text">
              Your request has been submitted! Check your{' '}
              <Link to={`/profile?tab=pending`}>profile's pending tab</Link> to check its
              status.
            </div>
          </div>
        </>
      );
    } else {
      content = <Loader size="large" tip="Submitting your request..." />;
    }

    return <div className="CCRFinal">{content}</div>;
  }

  private submit = () => {
    if (this.props.form) {
      this.props.submitCCR(this.props.form);
    }
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  (state: AppState) => ({
    form: state.ccr.form,
    submittedCCR: state.ccr.submittedCCR,
    submitError: state.ccr.submitError,
  }),
  {
    submitCCR: ccrActions.submitCCR,
  },
)(CCRFinal);
