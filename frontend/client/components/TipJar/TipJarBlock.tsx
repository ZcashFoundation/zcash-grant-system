import React from 'react';
import { Button, Form, Input, Tooltip } from 'antd';
import { TipJarModal } from './TipJarModal';
import { getAmountErrorFromString } from 'utils/validators';
import './TipJarBlock.less';
import '../Proposal/index.less';

interface Props {
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
    const { address, type } = this.props;
    const { tipAmount, modalOpen } = this.state;
    const amountError = tipAmount ? getAmountErrorFromString(tipAmount) : '';

    const addressNotSet = !address;
    const buttonTooltip = addressNotSet
      ? `Tipping address has not been set for ${type}`
      : '';
    const isDisabled = addressNotSet || !tipAmount || !!amountError;

    return (
      <div>
        <Form layout="vertical" className="TipJarBlock">
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
              placeholder="Show them you care"
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
              block
              disabled={isDisabled}
            >
              🎉 Tip
            </Button>
          </Tooltip>
        </Form>

        {address &&
          tipAmount && (
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
