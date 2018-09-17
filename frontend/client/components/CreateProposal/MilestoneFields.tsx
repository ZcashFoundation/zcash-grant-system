import React from 'react';
import { Input, DatePicker, Card, Icon, Alert, Checkbox } from 'antd';
import moment from 'moment';

export interface Milestone {
  title: string;
  description: string;
  date: string;
  payoutPercent: number;
  immediatePayout: boolean;
}

interface Props {
  index: number;
  milestone: Milestone;
  error: null | false | string;
  onChange(index: number, milestone: Milestone): void;
  onRemove(index: number): void;
}

const MilestoneFields = ({ index, milestone, error, onChange, onRemove }: Props) => (
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

export default MilestoneFields;
