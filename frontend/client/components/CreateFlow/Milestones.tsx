import React from 'react';
import { Form, Input, DatePicker, Card, Icon, Alert, Checkbox, Button } from 'antd';
import moment from 'moment';
import { ProposalDraft, CreateMilestone } from 'types';
import { getCreateErrors } from 'modules/create/utils';

interface State {
  milestones: ProposalDraft['milestones'];
}

interface Props {
  initialState: Partial<State>;
  updateForm(form: Partial<ProposalDraft>): void;
}

const DEFAULT_STATE: State = {
  milestones: [
    {
      title: '',
      content: '',
      dateEstimated: moment().unix(),
      payoutPercent: '',
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
    const milestones = [...oldMilestones, { ...DEFAULT_STATE.milestones[0] }];
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
            previousMilestoneDateEstimate={
              milestones[idx - 1] && milestones[idx - 1].dateEstimated
                ? moment(milestones[idx - 1].dateEstimated * 1000)
                : undefined
            }
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
  previousMilestoneDateEstimate: moment.Moment | undefined;
  error: Falsy | string;
  onChange(index: number, milestone: CreateMilestone): void;
  onRemove(index: number): void;
}

const MilestoneFields = ({
  index,
  milestone,
  error,
  onChange,
  onRemove,
  previousMilestoneDateEstimate,
}: MilestoneFieldsProps) => (
  <Card style={{ marginBottom: '2rem' }}>
    <div style={{ display: 'flex', marginBottom: '0.5rem', alignItems: 'center' }}>
      <Input
        size="large"
        placeholder="Milestone title"
        type="text"
        name="title"
        value={milestone.title}
        onChange={ev => onChange(index, { ...milestone, title: ev.currentTarget.value })}
        maxLength={80}
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
        name="content"
        placeholder="Description of what will be delivered"
        value={milestone.content}
        onChange={ev =>
          onChange(index, { ...milestone, content: ev.currentTarget.value })
        }
        maxLength={255}
      />
    </div>

    <div style={{ display: 'flex' }}>
      <DatePicker.MonthPicker
        style={{ flex: 1, marginRight: '0.5rem' }}
        placeholder="Expected completion date"
        value={
          milestone.dateEstimated ? moment(milestone.dateEstimated * 1000) : undefined
        }
        format="MMMM YYYY"
        allowClear={false}
        onChange={time => onChange(index, { ...milestone, dateEstimated: time.unix() })}
        disabled={milestone.immediatePayout}
        disabledDate={current => {
          if (!previousMilestoneDateEstimate) {
            return current
              ? current <
                  moment()
                    .subtract(1, 'month')
                    .endOf('month')
              : false;
          } else {
            return current
              ? current <
                  moment()
                    .subtract(1, 'month')
                    .endOf('month') || current < previousMilestoneDateEstimate
              : false;
          }
        }}
      />
      <Input
        value={milestone.payoutPercent}
        placeholder="Payout"
        onChange={ev =>
          onChange(index, {
            ...milestone,
            payoutPercent: ev.currentTarget.value,
          })
        }
        addonAfter="%"
        style={{ maxWidth: '120px', width: '100%' }}
        maxLength={6}
      />
      {index === 0 && (
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '0.5rem' }}>
          <Checkbox
            checked={milestone.immediatePayout}
            onChange={ev =>
              onChange(index, {
                ...milestone,
                immediatePayout: ev.target.checked,
                dateEstimated: ev.target.checked
                  ? moment().unix()
                  : milestone.dateEstimated,
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
