import React from 'react';
import { Link } from 'react-router-dom';
import { Modal } from 'antd';
import Result from 'ant-design-pro/lib/Result';
import { postProposalContribution, getProposalContribution } from 'api/api';
import { ContributionWithAddresses } from 'types';
import PaymentInfo from './PaymentInfo';

interface OwnProps {
  isVisible: boolean;
  contribution?: ContributionWithAddresses | Falsy;
  proposalId?: number;
  contributionId?: number;
  amount?: string;
  hasNoButtons?: boolean;
  text?: React.ReactNode;
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

  constructor(props: Props) {
    super(props);
    if (props.contribution) {
      this.state = {
        ...this.state,
        contribution: props.contribution,
      };
    }
  }

  componentWillUpdate(nextProps: Props) {
    const { isVisible, proposalId, contributionId, contribution } = nextProps;
    // When modal is opened and proposalId is provided or changed
    if (isVisible && proposalId) {
      if (this.props.isVisible !== isVisible || proposalId !== this.props.proposalId) {
        this.fetchAddresses(proposalId, contributionId);
      }
    }
    // If contribution is provided
    if (contribution !== this.props.contribution) {
      this.setState({ contribution: contribution || null });
    }
  }

  render() {
    const { isVisible, handleClose, hasNoButtons, text } = this.props;
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
              eye on it at the{' '}
              <Link to="/profile?tab=funded">funded tab on your profile</Link>.
            </>
          }
          style={{ width: '90%' }}
        />
      );
    } else {
      if (error) {
        content = error;
      } else {
        content = <PaymentInfo contribution={contribution} text={text} />;
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

  private async fetchAddresses(proposalId: number, contributionId?: number) {
    try {
      let res;
      if (contributionId) {
        res = await getProposalContribution(proposalId, contributionId);
      } else {
        res = await postProposalContribution(proposalId, this.props.amount || '0');
      }
      this.setState({ contribution: res.data });
    } catch (err) {
      this.setState({ error: err.message });
    }
  }

  private confirmSend = () => {
    // TODO: Mark on backend
    this.setState({ hasSent: true });
  };
}
