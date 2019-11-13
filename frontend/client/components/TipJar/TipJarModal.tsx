import React from 'react';
import { Modal, Icon, Button, Form, Input } from 'antd';
import classnames from 'classnames';
import QRCode from 'qrcode.react';
import { formatZcashCLI, formatZcashURI } from 'utils/formatters';
import { getAmountErrorFromString } from 'utils/validators'
import Loader from 'components/Loader';
import './TipJarModal.less';
import CopyInput from 'components/CopyInput';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type: 'user' | 'proposal';
  address: string;
  amount: string;
}

interface State {
  amount: string | null;
}

export class TipJarModal extends React.Component<Props, State> {
  static getDerivedStateFromProps = (nextProps: Props, prevState: State) => {
    return prevState.amount === null ? { amount: nextProps.amount } : {};
  };

  state: State = {
    amount: null,
  };

  render() {
    const { isOpen, onClose, type, address } = this.props;
    const { amount } = this.state;

    // should not be possible due to derived state, but makes TS happy
    if (amount === null) return;

    const amountError = getAmountErrorFromString(amount)
    const amountIsValid = !amountError

    const cli = amountIsValid ? formatZcashCLI(address, amount) : '';
    const uri = amountIsValid ? formatZcashURI(address, amount) : '';

    const content = (
      <div className="TipJarModal">
        <div className="TipJarModal-uri">
          <div>
            <div className={classnames('TipJarModal-uri-qr', !uri && 'is-loading')}>
              <span style={{ opacity: uri ? 1 : 0 }}>
                <QRCode value={uri || ''} />
              </span>
              {!uri && <Loader />}
            </div>
          </div>
          <div className="TipJarModal-uri-info">
            <Form.Item
              validateStatus={amountIsValid ? undefined : 'error'}
              label="Amount"
              className="TipJarModal-uri-info-input CopyInput"
              help={amountError}
            >
              <Input
                type="number"
                value={amount}
                placeholder="Amount to send"
                onChange={this.handleAmountChange}
                addonAfter="ZEC"
              />
            </Form.Item>
            <CopyInput
              className="TipJarModal-uri-info-input"
              label="Payment URI"
              value={uri}
              isTextarea
            />
            <Button type="ghost" size="large" href={uri} block>
              Open in Wallet <Icon type="link" />
            </Button>
          </div>
        </div>

        <div className="TipJarModal-fields">
          <div className="TipJarModal-fields-row">
            <CopyInput
              className="TipJarModal-fields-row-address"
              label="Address"
              value={address}
            />
          </div>
          <div className="TipJarModal-fields-row">
            <CopyInput
              label="Zcash CLI command"
              help="Make sure you replace YOUR_ADDRESS with your actual address"
              value={cli}
            />
          </div>
        </div>
      </div>
    );
    return (
      <Modal
        title={`Tip a ${type}`}
        visible={isOpen}
        okText={'Done'}
        onCancel={onClose}
        centered
        footer={
          <Button type="primary" onClick={onClose}>
            Done
          </Button>
        }
        afterClose={this.handleAfterClose}
      >
        {content}
      </Modal>
    );
  }

  private handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({
      amount: e.currentTarget.value,
    });

    private handleAfterClose = () => this.setState({ amount: null });
}
