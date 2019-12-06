import React from 'react';
import { Modal } from 'antd';
import './CCRSubmitWarningModal.less';

interface Props {
  isVisible: boolean;
  handleClose(): void;
  handleSubmit(): void;
}

export default class CCRSubmitWarningModal extends React.Component<Props> {
  render() {
    const { isVisible, handleClose, handleSubmit } = this.props;

    return (
      <Modal
        title={<>Confirm submission</>}
        visible={isVisible}
        okText={'Submit'}
        cancelText="Never mind"
        onOk={handleSubmit}
        onCancel={handleClose}
      >
        <div className="CCRSubmitWarningModal">
          <p>
            Are you sure you're ready to submit your request for approval? Once you’ve
            done so, you won't be able to edit it.
          </p>
        </div>
      </Modal>
    );
  }
}
