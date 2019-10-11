import React from 'react';
import { Input, Form } from 'antd';
import { ProposalDraft } from 'types';
import { getCreateErrors } from 'modules/create/utils';
import { DONATION } from 'utils/constants';

interface State {
  payoutAddress: string;
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
      ...(props.initialState || {}),
    };
  }

  render() {
    const { payoutAddress } = this.state;
    const errors = getCreateErrors(this.state, true);
    const payoutHelp =
      errors.payoutAddress ||
      `
      This must be a Sapling Z address
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
            onChange={this.handleInputChange}
          />
        </Form.Item>
      </Form>
    );
  }

  private handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value, name } = event.currentTarget;
    this.setState({ [name]: value } as any, () => {
      this.props.updateForm(this.state);
    });
  };
}
