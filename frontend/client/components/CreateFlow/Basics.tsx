import React from 'react';
import { Input, Form, Icon, Select } from 'antd';
import { SelectValue } from 'antd/lib/select';
import { PROPOSAL_CATEGORY, CATEGORY_UI } from 'api/constants';
import { CreateFormState } from 'types';
import { getCreateErrors } from 'modules/create/utils';
import { typedKeys } from 'utils/ts';

interface State {
  title: string;
  brief: string;
  category: PROPOSAL_CATEGORY | null;
  amountToRaise: string;
}

interface Props {
  initialState?: Partial<State>;
  updateForm(form: Partial<CreateFormState>): void;
}

export default class CreateFlowBasics extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      title: '',
      brief: '',
      category: null,
      amountToRaise: '',
      ...(props.initialState || {}),
    };
  }

  handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value, name } = event.currentTarget;
    this.setState({ [name]: value } as any, () => {
      this.props.updateForm(this.state);
    });
  };

  handleCategoryChange = (value: SelectValue) => {
    this.setState({ category: value as PROPOSAL_CATEGORY }, () => {
      this.props.updateForm(this.state);
    });
  };

  render() {
    const { title, brief, category, amountToRaise } = this.state;
    const errors = getCreateErrors(this.state, true);

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
          />
        </Form.Item>

        <Form.Item
          label="Brief"
          validateStatus={errors.brief ? 'error' : undefined}
          help={errors.brief}
        >
          <Input.TextArea
            name="brief"
            placeholder="An elevator-pitch version of your proposal, max 140 chars"
            value={brief}
            onChange={this.handleInputChange}
            rows={3}
          />
        </Form.Item>

        <Form.Item label="Category">
          <Select
            size="large"
            placeholder="Select a category"
            value={category || undefined}
            onChange={this.handleCategoryChange}
          >
            {typedKeys(PROPOSAL_CATEGORY).map(c => (
              <Select.Option value={c} key={c}>
                <Icon
                  type={CATEGORY_UI[c].icon}
                  style={{ color: CATEGORY_UI[c].color }}
                />{' '}
                {CATEGORY_UI[c].label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Target amount"
          validateStatus={errors.amountToRaise ? 'error' : undefined}
          help={
            errors.amountToRaise || 'This cannot be changed once your proposal starts'
          }
        >
          <Input
            size="large"
            name="amountToRaise"
            placeholder="1.5"
            type="number"
            value={amountToRaise}
            onChange={this.handleInputChange}
            addonAfter="ETH"
          />
        </Form.Item>
      </Form>
    );
  }
}
