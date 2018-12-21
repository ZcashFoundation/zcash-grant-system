import React from 'react';
import { connect } from 'react-redux';
import { Modal, Alert } from 'antd';
import { ProposalWithCrowdFund } from 'types';
import { AppState } from 'store/reducers';

interface OwnProps {
  proposal: ProposalWithCrowdFund;
  isVisible: boolean;
  handleClose(): void;
}

interface StateProps {
  isRefundActionPending: boolean;
  refundActionError: string;
}

type Props = StateProps & OwnProps;

class CancelModal extends React.Component<Props> {
  componentDidUpdate() {
    // TODO: Close on success of action
  }

  render() {
    const { isVisible, isRefundActionPending, refundActionError } = this.props;
    const hasContributors = false; // TODO: Determine if it has contributors from proposal
    const disabled = isRefundActionPending;

    return (
      <Modal
        title={<>Cancel proposal</>}
        visible={isVisible}
        okText="Confirm"
        cancelText="Never mind"
        onOk={this.cancelProposal}
        onCancel={this.closeModal}
        okButtonProps={{ type: 'danger', loading: disabled }}
        cancelButtonProps={{ disabled }}
      >
        <p>
          Are you sure you would like to cancel this proposal?{' '}
          <strong>This cannot be undone</strong>.
        </p>
        <p>
          Canceled proposals cannot be deleted and will still be viewable by contributors
          or anyone with a direct link. However, they will be de-listed everywhere else on
          Grant.io.
        </p>
        {hasContributors && (
          <p>
            Should you choose to cancel, we highly recommend posting an update to let your
            contributors know why you’ve decided to do so.
          </p>
        )}
        {refundActionError && (
          <Alert
            type="error"
            message="Failed to cancel proposal"
            description={refundActionError}
            showIcon
          />
        )}
      </Modal>
    );
  }

  private closeModal = () => {
    if (!this.props.isRefundActionPending) {
      this.props.handleClose();
    }
  };

  private cancelProposal = () => {
    console.warn('TODO - implement cancelProposal');
  };
}

export default connect<StateProps, {}, OwnProps, AppState>(state => {
  console.warn('TODO - redux isRefundActionPending/refundActionError?', state);
  return {
    isRefundActionPending: false,
    refundActionError: '',
  };
})(CancelModal);
