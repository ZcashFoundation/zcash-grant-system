import React from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import CCRFlow from 'components/CCRFlow';
import { initializeForm } from 'modules/ccr/actions';
import { AppState } from 'store/reducers';
import Loader from 'components/Loader';

interface StateProps {
  form: AppState['ccr']['form'];
  isInitializingForm: AppState['ccr']['isInitializingForm'];
  initializeFormError: AppState['ccr']['initializeFormError'];
}

interface DispatchProps {
  initializeForm: typeof initializeForm;
}

type Props = StateProps & DispatchProps & RouteComponentProps<{ id: string }>;

class RequestEdit extends React.Component<Props> {
  componentWillMount() {
    const proposalId = parseInt(this.props.match.params.id, 10);
    this.props.initializeForm(proposalId);
  }

  render() {
    const { form, initializeFormError } = this.props;
    if (form) {
      return <CCRFlow />;
    } else if (initializeFormError) {
      return <h1>{initializeFormError}</h1>;
    } else {
      return <Loader />;
    }
  }
}

const ConnectedRequestEdit = connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    form: state.ccr.form,
    isInitializingForm: state.ccr.isInitializingForm,
    initializeFormError: state.ccr.initializeFormError,
  }),
  { initializeForm },
)(RequestEdit);

export default withRouter(ConnectedRequestEdit);
