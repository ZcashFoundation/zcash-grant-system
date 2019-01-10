import React from 'react';
import { Modal } from 'antd';
import Result from 'ant-design-pro/lib/Result';
import { postProposalContribution, getProposalContribution } from 'api/api';
import { ContributionWithAddresses } from 'types';
import PaymentInfo from './PaymentInfo';

interface OwnProps {
  isVisible: boolean;
  proposalId?: number;
  contributionId?: number;
  amount?: string;
  hasNoButtons?: boolean;
  handleClose(): void;
}

type Props = OwnProps;

interface State {
  hasSent: boolean;
  contribution: ContributionWithAddresses | null;
  error: string | null;
}

export default class ContributionModal extends React.Component<Props, State> {
  state: State = {
    hasSent: false,
    contribution: null,
    error: null,
  };

  componentWillUpdate(nextProps: Props) {
    const { isVisible, proposalId, contributionId } = nextProps;
    // When modal is opened and proposalId is provided or changed
    if (isVisible && proposalId) {
      if (
        this.props.isVisible !== isVisible ||
        proposalId !== this.props.proposalId
      ) {
        this.fetchAddresses(proposalId, contributionId);
      }
    }
    
  }

  render() {
    const { isVisible, handleClose, hasNoButtons } = this.props;
    const { hasSent, contribution, error } = this.state;
    let content;

    if (hasSent) {
      content = (
        <Result
          type="success"
          title="Thank you for your contribution!"
          description={
            <>
              Your contribution should be confirmed in about 20 minutes. You can keep an
              eye on it at the <a>contributions tab on your profile</a>.
            </>
          }
          style={{ width: '90%' }}
        />
      );
    } else {
      if (error) {
        content = error;
      } else {
        content = <PaymentInfo contribution={contribution} />;
      }
    }

    return (
      <Modal
        title="Make your contribution"
        visible={isVisible}
        closable={hasSent || hasNoButtons}
        maskClosable={hasSent || hasNoButtons}
        okText={hasSent ? 'Done' : 'I’ve sent it'}
        onOk={hasSent ? handleClose : this.confirmSend}
        onCancel={handleClose}
        footer={hasNoButtons ? '' : undefined}
        centered
      >
        {content}
      </Modal>
    );
  }

  private async fetchAddresses(
    proposalId: number,
    contributionId?: number,
  ) {
    try {
      let res;
      if (contributionId) {
        res = await getProposalContribution(proposalId, contributionId);
      } else {
        res = await postProposalContribution(
          proposalId,
          this.props.amount || '0',
        );
      }
      this.setState({ contribution: res.data });
    } catch(err) {
      this.setState({ error: err.message });
    }
  }

  private confirmSend = () => {
    // TODO: Mark on backend
    this.setState({ hasSent: true });
  };
}
