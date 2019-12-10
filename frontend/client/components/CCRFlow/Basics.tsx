import React from 'react';
import { Form, Input } from 'antd';
import { CCRDraft } from 'types';
import { getCCRErrors } from 'modules/ccr/utils';

interface OwnProps {
  ccrId: number;
  initialState?: Partial<State>;

  updateForm(form: Partial<CCRDraft>): void;
}

type Props = OwnProps;

interface State extends Partial<CCRDraft> {
  title: string;
  brief: string;
  target: string;
}

class CCRFlowBasics extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      title: '',
      brief: '',
      target: '',
      ...(props.initialState || {}),
    };
  }

  render() {
    const { title, brief, target } = this.state;
    const errors = getCCRErrors(this.state, true);

    // Don't show target error at zero since it defaults to that
    // Error just shows up at the end to prevent submission
    if (target === '0') {
      errors.target = undefined;
    }

    return (
      <Form layout="vertical" style={{ maxWidth: 600, margin: '0 auto' }}>
        <Form.Item
          label="Title"
          validateStatus={errors.title ? 'error' : undefined}
          help={errors.title}
        >
          <Input
            size="large"
            name="title"
            placeholder="Short and sweet"
            type="text"
            value={title}
            onChange={this.handleInputChange}
            maxLength={200}
          />
        </Form.Item>

        <Form.Item
          label="Brief"
          validateStatus={errors.brief ? 'error' : undefined}
          help={errors.brief}
        >
          <Input.TextArea
            name="brief"
            placeholder="An elevator-pitch version of your request, max 140 chars"
            value={brief}
            onChange={this.handleInputChange}
            rows={3}
            maxLength={200}
          />
        </Form.Item>

        <Form.Item
          label="Target amount"
          validateStatus={errors.target ? 'error' : undefined}
          help={
            errors.target ||
            'Accepted proposals will be paid out in ZEC based in USD market price at payout time. Zcash Foundation administrators may opt to adjust this value before approval.'
          }
        >
          <Input
            size="large"
            name="target"
            placeholder="500"
            type="number"
            value={target}
            onChange={this.handleInputChange}
            addonBefore="$"
            maxLength={16}
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

export default CCRFlowBasics;
