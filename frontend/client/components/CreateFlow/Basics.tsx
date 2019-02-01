import React from 'react';
import { Input, Form, Icon, Select, Alert } from 'antd';
import { SelectValue } from 'antd/lib/select';
import { PROPOSAL_CATEGORY, CATEGORY_UI } from 'api/constants';
import { ProposalDraft, RFP } from 'types';
import { getCreateErrors } from 'modules/create/utils';
import { typedKeys } from 'utils/ts';
import { Link } from 'react-router-dom';

interface State extends Partial<ProposalDraft> {
  title: string;
  brief: string;
  category?: PROPOSAL_CATEGORY;
  target: string;
  rfp?: RFP;
}

interface Props {
  initialState?: Partial<State>;
  updateForm(form: Partial<ProposalDraft>): void;
}

export default class CreateFlowBasics extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      title: '',
      brief: '',
      category: undefined,
      target: '',
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
    const { title, brief, category, target, rfp } = this.state;
    const errors = getCreateErrors(this.state, true);

    return (
      <Form layout="vertical" style={{ maxWidth: 600, margin: '0 auto' }}>
        {rfp && (
          <Alert
            type="info"
            message="This proposal is linked to a request"
            description={
              <>
                This proposal is for the open request{' '}
                <Link to={`/requests/${rfp.id}`} target="_blank">
                  {rfp.title}
                </Link>
                . If you didn’t mean to do this, you can delete this proposal and create a
                new one.
              </>
            }
            style={{ marginBottom: '2rem' }}
            showIcon
          />
        )}

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
          validateStatus={errors.target ? 'error' : undefined}
          help={errors.target || 'This cannot be changed once your proposal starts'}
        >
          <Input
            size="large"
            name="target"
            placeholder="1.5"
            type="number"
            value={target}
            onChange={this.handleInputChange}
            addonAfter="ZEC"
          />
        </Form.Item>
      </Form>
    );
  }
}
