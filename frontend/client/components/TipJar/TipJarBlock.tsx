import React from 'react';
import { Button, Form, Input, Tooltip } from 'antd';
import { TipJarModal } from './TipJarModal';
import { getAmountErrorFromString } from 'utils/validators';
import './TipJarBlock.less';
import '../Proposal/index.less';

interface Props {
  isCard?: boolean;
  hideTitle?: boolean;
  address?: string | null;
  type: 'user' | 'proposal';
}

const STATE = {
  tipAmount: '',
  modalOpen: false,
};

type State = typeof STATE;

export class TipJarBlock extends React.Component<Props, State> {
  state = STATE;

  render() {
    const { isCard, address, type, hideTitle } = this.props;
    const { tipAmount, modalOpen } = this.state;
    const amountError = tipAmount ? getAmountErrorFromString(tipAmount) : '';

    const addressNotSet = !address;
    const buttonTooltip = addressNotSet
      ? `Tipping address has not been set for ${type}`
      : '';
    const isDisabled = addressNotSet || !tipAmount || !!amountError;

    return (
      <div className={isCard ? 'Proposal-top-main-block' : undefined}>
        <Form layout="vertical" className="TipJarBlock">
          {!hideTitle && <h1 className="TipJarBlock-title">Tip</h1>}
          <Form.Item
            validateStatus={amountError ? 'error' : undefined}
            help={amountError}
            style={{ marginBottom: '0.5rem', paddingBottom: 0 }}
          >
            <Input
              size="large"
              name="amountToTip"
              type="number"
              value={tipAmount}
              placeholder="0.5"
              min={0}
              step={0.1}
              onChange={this.handleAmountChange}
              addonAfter="ZEC"
            />
          </Form.Item>
          <Tooltip placement={'bottomRight'} title={buttonTooltip}>
            <Button
              onClick={this.handleTipJarModalOpen}
              size="large"
              type="primary"
              disabled={isDisabled}
              block
            >
              Donate
            </Button>
          </Tooltip>
        </Form>

        {address && tipAmount && (
          <TipJarModal
            isOpen={modalOpen}
            onClose={this.handleTipJarModalClose}
            type={type}
            address={address}
            amount={tipAmount}
          />
        )}
      </div>
    );
  }

  private handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({
      tipAmount: e.currentTarget.value,
    });

  private handleTipJarModalOpen = () =>
    this.setState({
      modalOpen: true,
    });

  private handleTipJarModalClose = () =>
    this.setState({
      modalOpen: false,
    });
}
