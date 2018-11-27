import React from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { Spin } from 'antd';
import Web3Container from 'lib/Web3Container';
import CreateFlow from 'components/CreateFlow';
import { initializeForm } from 'modules/create/actions';
import { AppState } from 'store/reducers';

interface StateProps {
  form: AppState['create']['form'];
  isInitializingForm: AppState['create']['isInitializingForm'];
  initializeFormError: AppState['create']['initializeFormError'];
}

interface DispatchProps {
  initializeForm: typeof initializeForm;
}

type Props = StateProps & DispatchProps & RouteComponentProps<{ id: string }>;

class ProposalEdit extends React.Component<Props> {
  componentWillMount() {
    const proposalId = parseInt(this.props.match.params.id, 10);
    this.props.initializeForm(proposalId);
  }

  render() {
    const { form, initializeFormError } = this.props;

    if (form) {
      return (
        <Web3Container
          renderLoading={() => <Spin />}
          render={({ accounts }) => (
            <div style={{ paddingTop: '3rem', paddingBottom: '8rem' }}>
              <CreateFlow accounts={accounts} />
            </div>
          )}
        />
      );
    } else if (initializeFormError) {
      return <h1>{initializeFormError}</h1>;
    } else {
      return <Spin />;
    }
  }
}

const ConnectedProposalEdit = connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    form: state.create.form,
    isInitializingForm: state.create.isInitializingForm,
    initializeFormError: state.create.initializeFormError,
  }),
  { initializeForm },
)(ProposalEdit);

export default withRouter(ConnectedProposalEdit);
