import React from 'react';
import { Modal, Alert } from 'antd';
import { getCreateWarnings } from 'modules/create/utils';
import { ProposalDraft } from 'types';
import './PublishWarningModal.less';

interface Props {
  proposal: ProposalDraft | null;
  isVisible: boolean;
  handleClose(): void;
  handlePublish(): void;
}

export default class PublishWarningModal extends React.Component<Props> {
  render() {
    const { proposal, isVisible, handleClose, handlePublish } = this.props;
    const warnings = proposal ? getCreateWarnings(proposal) : [];

    return (
      <Modal
        title={<>Confirm publish</>}
        visible={isVisible}
        okText="Confirm publish"
        cancelText="Never mind"
        onOk={handlePublish}
        onCancel={handleClose}
      >
        <div className="PublishWarningModal">
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
                  <p>You can still publish, despite these warnings.</p>
                </>
              }
            />
          )}
          <p>
            Are you sure you’re ready to publish your proposal? Once you’ve done so, you
            won't be able to change certain fields such as: target amount, payout address,
            team, & deadline.
          </p>
        </div>
      </Modal>
    );
  }
}
