import React from 'react';
import { connect } from 'react-redux';
import { Spin, Icon } from 'antd';
import { Link } from 'react-router-dom';
import { createActions } from 'modules/create';
import { AppState } from 'store/reducers';
import './Final.less';

interface StateProps {
  form: AppState['create']['form'];
  crowdFundError: AppState['web3']['crowdFundError'];
  crowdFundCreatedAddress: AppState['web3']['crowdFundCreatedAddress'];
}

interface DispatchProps {
  createProposal: typeof createActions['createProposal'];
  resetForm: typeof createActions['resetForm'];
}

type Props = StateProps & DispatchProps;

class CreateFinal extends React.Component<Props> {
  componentDidMount() {
    this.create();
  }

  componentDidUpdate(prevProps: Props) {
    if (!prevProps.crowdFundCreatedAddress && this.props.crowdFundCreatedAddress) {
      this.props.resetForm();
    }
  }

  render() {
    const { crowdFundError, crowdFundCreatedAddress } = this.props;
    let content;
    if (crowdFundError) {
      content = (
        <div className="CreateFinal-message is-error">
          <Icon type="close-circle" />
          <div className="CreateFinal-message-text">
            Something went wrong during creation: "{crowdFundError}"{' '}
            <a onClick={this.create}>Click here</a> to try again.
          </div>
        </div>
      );
    } else if (crowdFundCreatedAddress) {
      content = (
        <div className="CreateFinal-message is-success">
          <Icon type="check-circle" />
          <div className="CreateFinal-message-text">
            Your proposal is now live and on the blockchain!{' '}
            <Link to={`/proposals/${crowdFundCreatedAddress}`}>Click here</Link> to check
            it out.
          </div>
        </div>
      );
    } else {
      content = (
        <div className="CreateFinal-loader">
          <Spin size="large" />
          <div className="CreateFinal-loader-text">Deploying contract...</div>
        </div>
      );
    }

    return <div className="CreateFinal">{content}</div>;
  }

  private create = () => {
    this.props.createProposal(this.props.form);
  };
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  (state: AppState) => ({
    form: state.create.form,
    crowdFundError: state.web3.crowdFundError,
    crowdFundCreatedAddress: state.web3.crowdFundCreatedAddress,
  }),
  {
    createProposal: createActions.createProposal,
    resetForm: createActions.resetForm,
  },
)(CreateFinal);
