import React from 'react';
import { Form, Input, DatePicker, Card, Icon, Alert, Checkbox, Button } from 'antd';
import moment from 'moment';
import { CreateFormState, CreateMilestone } from 'types';
import { getCreateErrors } from 'modules/create/utils';

interface State {
  milestones: CreateMilestone[];
}

interface Props {
  initialState: Partial<State>;
  updateForm(form: Partial<CreateFormState>): void;
}

const DEFAULT_STATE: State = {
  milestones: [
    {
      title: '',
      description: '',
      date: '',
      payoutPercent: 100,
      immediatePayout: false,
    },
  ],
};

export default class CreateFlowMilestones extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...DEFAULT_STATE,
      ...(props.initialState || {}),
    };

    // Don't allow for empty milestones array
    if (!this.state.milestones.length) {
      this.state = {
        ...this.state,
        milestones: [...DEFAULT_STATE.milestones],
      };
    }
  }

  handleMilestoneChange = (index: number, milestone: CreateMilestone) => {
    const milestones = [...this.state.milestones];
    milestones[index] = milestone;
    this.setState({ milestones }, () => {
      this.props.updateForm(this.state);
    });
  };

  addMilestone = () => {
    const { milestones: oldMilestones } = this.state;
    const lastMilestone = oldMilestones[oldMilestones.length - 1];
    const halfPayout = lastMilestone.payoutPercent / 2;
    const milestones = [
      ...oldMilestones,
      {
        ...DEFAULT_STATE.milestones[0],
        payoutPercent: halfPayout,
      },
    ];
    milestones[milestones.length - 2] = {
      ...lastMilestone,
      payoutPercent: halfPayout,
    };
    this.setState({ milestones });
  };

  removeMilestone = (index: number) => {
    let milestones = this.state.milestones.filter((_, i) => i !== index);
    if (milestones.length === 0) {
      milestones = [...DEFAULT_STATE.milestones];
    }
    this.setState({ milestones }, () => {
      this.props.updateForm(this.state);
    });
  };

  render() {
    const { milestones } = this.state;
    const errors = getCreateErrors(this.state, true);

    return (
      <Form layout="vertical" style={{ maxWidth: 720, margin: '0 auto' }}>
        {milestones.map((milestone, idx) => (
          <MilestoneFields
            key={idx}
            milestone={milestone}
            index={idx}
            error={errors.milestones && errors.milestones[idx]}
            onChange={this.handleMilestoneChange}
            onRemove={this.removeMilestone}
          />
        ))}

        {milestones.length < 10 && (
          <Button type="dashed" onClick={this.addMilestone}>
            <Icon type="plus" /> Add another milestone
          </Button>
        )}
      </Form>
    );
  }
}

interface MilestoneFieldsProps {
  index: number;
  milestone: CreateMilestone;
  error: null | false | string;
  onChange(index: number, milestone: CreateMilestone): void;
  onRemove(index: number): void;
}

const MilestoneFields = ({
  index,
  milestone,
  error,
  onChange,
  onRemove,
}: MilestoneFieldsProps) => (
  <Card style={{ marginBottom: '2rem' }}>
    <div style={{ display: 'flex', marginBottom: '0.5rem', alignItems: 'center' }}>
      <Input
        size="large"
        placeholder="Title"
        type="text"
        name="title"
        value={milestone.title}
        onChange={ev => onChange(index, { ...milestone, title: ev.currentTarget.value })}
      />
      <button
        onClick={() => onRemove(index)}
        style={{
          paddingLeft: '0.5rem',
          fontSize: '1.5rem',
          cursor: 'pointer',
          opacity: 0.8,
        }}
      >
        <Icon type="close-circle-o" />
      </button>
    </div>

    <div style={{ marginBottom: '0.5rem' }}>
      <Input.TextArea
        rows={3}
        name="body"
        placeholder="Description of the deliverable"
        value={milestone.description}
        onChange={ev =>
          onChange(index, { ...milestone, description: ev.currentTarget.value })
        }
      />
    </div>

    <div style={{ display: 'flex' }}>
      <DatePicker.MonthPicker
        style={{ flex: 1, marginRight: '0.5rem' }}
        placeholder="Expected completion date"
        value={milestone.date ? moment(milestone.date) : undefined}
        format="MMMM YYYY"
        allowClear={false}
        onChange={(_, date) => onChange(index, { ...milestone, date })}
      />
      <Input
        min={1}
        max={100}
        type="number"
        value={milestone.payoutPercent}
        onChange={ev =>
          onChange(index, {
            ...milestone,
            payoutPercent: parseInt(ev.currentTarget.value, 10) || 0,
          })
        }
        addonAfter="%"
        style={{ maxWidth: '120px', width: '100%' }}
      />
      {index === 0 && (
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '0.5rem' }}>
          <Checkbox
            checked={milestone.immediatePayout}
            onChange={ev =>
              onChange(index, {
                ...milestone,
                immediatePayout: ev.target.checked,
              })
            }
          >
            <span style={{ opacity: 0.7 }}>Payout Immediately</span>
          </Checkbox>
        </div>
      )}
    </div>

    {error && (
      <Alert style={{ marginTop: '1rem' }} type="error" message={error} showIcon />
    )}
  </Card>
);
