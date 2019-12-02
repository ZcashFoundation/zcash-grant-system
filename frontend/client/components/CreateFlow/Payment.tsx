import React from 'react';
import { Input, Form } from 'antd';
import { ProposalDraft } from 'types';
import { getCreateErrors } from 'modules/create/utils';
import { DONATION } from 'utils/constants';

interface State {
  payoutAddress: string;
  tipJarAddress: string;
}

interface Props {
  initialState?: Partial<State>;
  updateForm(form: Partial<ProposalDraft>): void;
}

export default class CreateFlowPayment extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      payoutAddress: '',
      tipJarAddress: '',
      ...(props.initialState || {}),
    };
  }

  render() {
    const { payoutAddress, tipJarAddress } = this.state;
    const errors = getCreateErrors(this.state, true);
    const payoutHelp =
      errors.payoutAddress ||
      `
      This must be a Sapling Z address
    `;
    const tipJarHelp =
      errors.tipJarAddress ||
      `
      Allows your proposal to receive tips. Must be a Sapling Z address
    `;

    return (
      <Form layout="vertical" style={{ maxWidth: 600, margin: '0 auto' }}>
        <Form.Item
          label="Payout address"
          validateStatus={errors.payoutAddress ? 'error' : undefined}
          help={payoutHelp}
          style={{ marginBottom: '2rem' }}
        >
          <Input
            size="large"
            name="payoutAddress"
            placeholder={DONATION.ZCASH_SAPLING}
            type="text"
            value={payoutAddress}
            onChange={this.handlePaymentInputChange}
          />
        </Form.Item>

        <Form.Item
          label="Tip address (optional)"
          validateStatus={errors.tipJarAddress ? 'error' : undefined}
          help={tipJarHelp}
          style={{ marginBottom: '2rem' }}
        >
          <Input
            size="large"
            name="tipJarAddress"
            placeholder={DONATION.ZCASH_SAPLING}
            type="text"
            value={tipJarAddress}
            onChange={this.handleTippingInputChange}
          />
        </Form.Item>
      </Form>
    );
  }

  private handlePaymentInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value, name } = event.currentTarget;
    this.setState({ [name]: value } as any, () => {
      this.props.updateForm(this.state);
    });
  };

  private handleTippingInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value, name } = event.currentTarget;
    this.setState({ [name]: value } as any, () => {
      this.props.updateForm(this.state);
    });
  };
}
