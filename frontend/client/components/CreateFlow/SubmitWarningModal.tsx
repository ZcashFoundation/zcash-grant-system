import React from 'react';
import { Modal, Alert } from 'antd';
import { getCreateWarnings } from 'modules/create/utils';
import { ProposalDraft } from 'types';
import './SubmitWarningModal.less';

interface Props {
  proposal: ProposalDraft | null;
  isVisible: boolean;
  handleClose(): void;
  handleSubmit(): void;
}

export default class SubmitWarningModal extends React.Component<Props> {
  render() {
    const { proposal, isVisible, handleClose, handleSubmit } = this.props;
    const warnings = proposal ? getCreateWarnings(proposal) : [];

    return (
      <Modal
        title={<>Confirm submission</>}
        visible={isVisible}
        okText={'Submit'}
        cancelText="Never mind"
        onOk={handleSubmit}
        onCancel={handleClose}
      >
        <div className="SubmitWarningModal">
          {!!warnings.length && (
            <Alert
              type="warning"
              showIcon
              message="Some fields have warnings"
              description={
                <>
                  <ul>
                    {warnings.map(w => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                  <p>You can still submit, despite these warnings.</p>
                </>
              }
            />
          )}
          <p>
            Are you sure you're ready to submit your proposal for approval? Once you’ve
            done so, you won't be able to edit it.
          </p>
        </div>
      </Modal>
    );
  }
}
