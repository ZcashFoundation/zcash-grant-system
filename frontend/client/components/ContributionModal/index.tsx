import React from 'react';
import { Modal } from 'antd';
import Result from 'ant-design-pro/lib/Result';
import { postProposalContribution } from 'api/api';
import { Contribution } from 'types';
import PaymentInfo from './PaymentInfo';

interface OwnProps {
  isVisible: boolean;
  proposalId: number;
  amount?: string;
  handleClose(): void;
}

type Props = OwnProps;

interface State {
  hasSent: boolean;
  contribution: Contribution | null;
  error: string | null;
}

export default class ContributionModal extends React.Component<Props, State> {
  state: State = {
    hasSent: false,
    contribution: null,
    error: null,
  };

  componentWillUpdate(nextProps: Props) {
    const { isVisible, proposalId } = nextProps
    if (isVisible && this.props.isVisible !== isVisible) {
      this.fetchAddresses(proposalId);
    }
    else if (proposalId !== this.props.proposalId) {
      this.fetchAddresses(proposalId);
    }
  }

  render() {
    const { isVisible, handleClose } = this.props;
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
        closable={hasSent}
        okText={hasSent ? 'Done' : 'I’ve sent it'}
        onOk={hasSent ? handleClose : this.confirmSend}
        onCancel={handleClose}
        centered
      >
        {content}
      </Modal>
    );
  }

  private async fetchAddresses(proposalId: number) {
    try {
      const res = await postProposalContribution(
        proposalId,
        this.props.amount || '0',
      );
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
