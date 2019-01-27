import React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'antd';
import { Link } from 'react-router-dom';
import Loader from 'components/Loader';
import { createActions } from 'modules/create';
import { AppState } from 'store/reducers';
import './Final.less';

interface StateProps {
  form: AppState['create']['form'];
  submittedProposal: AppState['create']['submittedProposal'];
  submitError: AppState['create']['submitError'];
}

interface DispatchProps {
  submitProposal: typeof createActions['submitProposal'];
}

type Props = StateProps & DispatchProps;

class CreateFinal extends React.Component<Props> {
  componentDidMount() {
    this.submit();
  }

  render() {
    const { submittedProposal, submitError } = this.props;
    let content;
    if (submitError) {
      content = (
        <div className="CreateFinal-message is-error">
          <Icon type="close-circle" />
          <div className="CreateFinal-message-text">
            Something went wrong during creation: "{submitError}"{' '}
            <a onClick={this.submit}>Click here</a> to try again.
          </div>
        </div>
      );
    } else if (submittedProposal) {
      content = (
        <div className="CreateFinal-message is-success">
          <Icon type="check-circle" />
          <div className="CreateFinal-message-text">
            Your proposal has been submitted! Check your{' '}
            <Link to={`/profile?tab=pending`}>profile's pending proposals tab</Link> to
            check its status.
          </div>
          {/* TODO - remove or rework depending on design choices */}
          {/* <div className="CreateFinal-message-text">
            Your proposal has been submitted!{' '}
            <Link to={`/proposals/${submittedProposal.proposalUrlId}`}>
              Click here
            </Link>
            {' '}to check it out.
          </div> */}
        </div>
      );
    } else {
      content = <Loader size="large" tip="Submitting your proposal..." />;
    }

    return <div className="CreateFinal">{content}</div>;
  }

  private submit = () => {
    if (this.props.form) {
      this.props.submitProposal(this.props.form);
    }
  };
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  (state: AppState) => ({
    form: state.create.form,
    submittedProposal: state.create.submittedProposal,
    submitError: state.create.submitError,
  }),
  {
    submitProposal: createActions.submitProposal,
  },
)(CreateFinal);
