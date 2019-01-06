import React from 'react';
import { Modal } from 'antd';
import Result from 'ant-design-pro/lib/Result';
import PaymentInfo from './PaymentInfo';

interface OwnProps {
  isVisible: boolean;
  amount?: string;
  handleClose(): void;
}

type Props = OwnProps;

interface State {
  hasSent: boolean;
}

export default class ContributionModal extends React.Component<Props, State> {
  state: State = {
    hasSent: false,
  };

  render() {
    const { isVisible, handleClose } = this.props;
    const { hasSent } = this.state;
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
        />
      );
    } else {
      content = <PaymentInfo />;
    }

    return (
      <Modal
        title="Make your contribution"
        visible={isVisible}
        closable={hasSent}
        okText={hasSent ? 'Done' : 'I’ve sent it'}
        onOk={hasSent ? handleClose : this.confirmSend}
      >
        {content}
      </Modal>
    );
  }

  private confirmSend = () => {
    // TODO: Mark on backend
    this.setState({ hasSent: true });
  };
}
