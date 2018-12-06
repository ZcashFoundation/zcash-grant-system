import React from 'react';
import { Input, Form, Icon, Button, Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import { ProposalDraft } from 'types';
import { getCreateErrors } from 'modules/create/utils';
import { ONE_DAY } from 'utils/time';
import { DONATION } from 'utils/constants';

interface State {
  payoutAddress: string;
  trustees: string[];
  deadlineDuration: number;
  voteDuration: number;
}

interface Props {
  initialState?: Partial<State>;
  updateForm(form: Partial<ProposalDraft>): void;
}

export default class CreateFlowTeam extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      payoutAddress: '',
      trustees: [],
      deadlineDuration: ONE_DAY * 60,
      voteDuration: ONE_DAY * 7,
      ...(props.initialState || {}),
    };
  }

  render() {
    const { payoutAddress, trustees, deadlineDuration, voteDuration } = this.state;
    const errors = getCreateErrors(this.state, true);

    return (
      <Form layout="vertical" style={{ maxWidth: 600, margin: '0 auto' }}>
        <Form.Item
          label="Payout address"
          validateStatus={errors.payoutAddress ? 'error' : undefined}
          help={errors.payoutAddress}
        >
          <Input
            size="large"
            name="payoutAddress"
            placeholder={DONATION.ETH}
            type="text"
            value={payoutAddress}
            onChange={this.handleInputChange}
          />
        </Form.Item>

        <Form.Item label="Trustee addresses">
          <Input
            placeholder="Payout address will also become a trustee"
            size="large"
            type="text"
            disabled
            value={payoutAddress}
          />
        </Form.Item>
        {trustees.map((address, idx) => (
          <TrusteeFields
            key={idx}
            value={address}
            index={idx}
            error={errors.trustees && errors.trustees[idx]}
            onChange={this.handleTrusteeChange}
            onRemove={this.removeTrustee}
          />
        ))}
        {trustees.length < 9 && (
          <Button
            type="dashed"
            onClick={this.addTrustee}
            style={{ margin: '-1rem 0 2rem' }}
          >
            <Icon type="plus" /> Add another trustee
          </Button>
        )}

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

        <Form.Item label="Milestone Voting Period">
          <Radio.Group
            name="voteDuration"
            value={voteDuration}
            onChange={this.handleRadioChange}
            size="large"
            style={{ display: 'flex', textAlign: 'center' }}
          >
            {voteDuration === 60 && (
              <Radio.Button style={{ flex: 1 }} value={60}>
                60 Seconds
              </Radio.Button>
            )}
            <Radio.Button style={{ flex: 1 }} value={ONE_DAY * 3}>
              3 Days
            </Radio.Button>
            <Radio.Button style={{ flex: 1 }} value={ONE_DAY * 7}>
              7 Days
            </Radio.Button>
            <Radio.Button style={{ flex: 1 }} value={ONE_DAY * 10}>
              10 Days
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

  private handleTrusteeChange = (index: number, value: string) => {
    const trustees = [...this.state.trustees];
    trustees[index] = value;
    this.setState({ trustees }, () => {
      this.props.updateForm(this.state);
    });
  };

  private addTrustee = () => {
    const trustees = [...this.state.trustees, ''];
    this.setState({ trustees });
  };

  private removeTrustee = (index: number) => {
    const trustees = this.state.trustees.filter((_, i) => i !== index);
    this.setState({ trustees }, () => {
      this.props.updateForm(this.state);
    });
  };
}

interface TrusteeFieldsProps {
  index: number;
  value: string;
  error: string | Falsy;
  onChange(index: number, value: string): void;
  onRemove(index: number): void;
}

const TrusteeFields = ({
  index,
  value,
  error,
  onChange,
  onRemove,
}: TrusteeFieldsProps) => (
  <Form.Item
    validateStatus={error ? 'error' : undefined}
    help={error}
    style={{ marginTop: '-1rem' }}
  >
    <div style={{ display: 'flex' }}>
      <Input
        size="large"
        placeholder={DONATION.ETH}
        type="text"
        value={value}
        onChange={ev => onChange(index, ev.currentTarget.value)}
      />
      <button
        onClick={() => onRemove(index)}
        style={{
          paddingLeft: '0.5rem',
          fontSize: '1.3rem',
          cursor: 'pointer',
        }}
      >
        <Icon type="close-circle-o" />
      </button>
    </div>
  </Form.Item>
);
