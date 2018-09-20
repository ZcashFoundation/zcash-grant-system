import React from 'react';
import { Input, Form, Icon } from 'antd';

interface Props {
  index: number;
  value: string;
  error: null | false | string;
  onChange(index: number, value: string): void;
  onRemove(index: number): void;
}

const TrusteeFields = ({ index, value, error, onChange, onRemove }: Props) => (
  <Form.Item validateStatus={error ? 'error' : undefined} help={error}>
    <div style={{ display: 'flex' }}>
      <Input
        size="large"
        placeholder="0xe12a34230e5e7fc73d094e52025135e4fbf24653"
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

export default TrusteeFields;
