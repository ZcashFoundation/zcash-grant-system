import React from 'react';
import { Input, Form, Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import { ProposalDraft } from 'types';
import { getCreateErrors } from 'modules/create/utils';
import { ONE_DAY } from 'utils/time';
import { DONATION } from 'utils/constants';

interface State {
  payoutAddress: string;
  deadlineDuration: number;
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
      deadlineDuration: ONE_DAY * 60,
      ...(props.initialState || {}),
    };
  }

  render() {
    const { payoutAddress, deadlineDuration } = this.state;
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

        <Form.Item label="Funding Deadline">
          <Radio.Group
            name="deadlineDuration"
            value={deadlineDuration}
            onChange={this.handleRadioChange}
            size="large"
            style={{ display: 'flex', textAlign: 'center' }}
          >
            {deadlineDuration === 300 && (
              <Radio.Button style={{ flex: 1 }} value={300}>
                5 minutes
              </Radio.Button>
            )}
            <Radio.Button style={{ flex: 1 }} value={ONE_DAY * 30}>
              30 Days
            </Radio.Button>
            <Radio.Button style={{ flex: 1 }} value={ONE_DAY * 60}>
              60 Days
            </Radio.Button>
            <Radio.Button style={{ flex: 1 }} value={ONE_DAY * 90}>
              90 Days
            </Radio.Button>
          </Radio.Group>
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

  private handleRadioChange = (event: RadioChangeEvent) => {
    const { value, name } = event.target;
    this.setState({ [name as string]: value } as any, () => {
      this.props.updateForm(this.state);
    });
  };
}
