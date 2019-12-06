import React from 'react';
import { Modal } from 'antd';
import { Link } from 'react-router-dom';
import { Proposal } from 'types';

interface Props {
  proposal: Proposal;
  isVisible: boolean;
  handleClose(): void;
}

export default class CancelModal extends React.Component<Props> {
  render() {
    const {
      isVisible,
      handleClose,
      proposal: { isVersionTwo },
    } = this.props;

    return (
      <Modal
        title={<>Cancel proposal</>}
        visible={isVisible}
        okText="OK"
        cancelText="Cancel"
        onOk={handleClose}
        onCancel={handleClose}
      >
        <p>
          Are you sure you would like to cancel this proposal
          {isVersionTwo ? '' : ', and refund any contributors'}?{' '}
          <strong>This cannot be undone</strong>.
        </p>
        <p>
          Canceled proposals cannot be deleted and will still be viewable by{' '}
          {isVersionTwo ? '' : 'contributors or '}
          anyone with a direct link. However, they will be de-listed everywhere else on ZF
          Grants.
        </p>
        <p>
          If you're sure you'd like to cancel, please{' '}
          <Link to="/contact">contact support</Link> to let us know. Canceling can only be
          done by site admins.
        </p>
      </Modal>
    );
  }
}
