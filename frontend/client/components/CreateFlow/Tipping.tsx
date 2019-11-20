import React from 'react';
import { Input, Form } from 'antd';
import { ProposalDraft } from 'types';
import { getCreateErrors } from 'modules/create/utils';
import { DONATION } from 'utils/constants';

interface State {
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
      tipJarAddress: '',
      ...(props.initialState || {}),
    };
  }

  render() {
    const { tipJarAddress } = this.state;
    const errors = getCreateErrors(this.state, true);
    const tipJarHelp =
      errors.payoutAddress ||
      `
      This must be a Sapling Z address
    `;

    return (
      <Form layout="vertical" style={{ maxWidth: 600, margin: '0 auto' }}>
        <Form.Item
          label="Tip address"
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
