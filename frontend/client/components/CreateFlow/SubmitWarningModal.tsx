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

    const staked = proposal && proposal.isStaked;

    return (
      <Modal
        title={<>Confirm submission</>}
        visible={isVisible}
        okText={staked ? 'Submit' : `I'm ready to stake`}
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
          {staked && (
            <p>
              Are you sure you're ready to submit your proposal for approval? Once you’ve
              done so, you won't be able to edit it.
            </p>
          )}
          {!staked && (
            <p>
              Are you sure you're ready to submit your proposal? You will be asked to send
              a staking contribution of <b>{process.env.PROPOSAL_STAKING_AMOUNT} ZEC</b>.
              Once confirmed, the proposal will be submitted for approval by site
              administrators.
            </p>
          )}
        </div>
      </Modal>
    );
  }
}
