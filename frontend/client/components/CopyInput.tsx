import React from 'react';
import { Button, Form, Input, message } from 'antd';
import classnames from 'classnames';
import CopyToClipboard from 'react-copy-to-clipboard';

interface CopyInputProps {
  label: string;
  value: string | undefined;
  className?: string;
  help?: string;
  isTextarea?: boolean;
}

const CopyInput: React.SFC<CopyInputProps> = ({
  label,
  value,
  help,
  className,
  isTextarea,
}) => (
  <Form.Item
    className={classnames('CopyInput', className, isTextarea && 'is-textarea')}
    label={label}
    help={help}
  >
    {isTextarea ? (
      <>
        <Input.TextArea value={value} readOnly rows={3} />
        <CopyToClipboard text={value || ''} onCopy={() => message.success('Copied!', 2)}>
          <Button icon="copy" />
        </CopyToClipboard>
      </>
    ) : (
      <>
        <Input value={value} readOnly />
        <CopyToClipboard text={value || ''} onCopy={() => message.success('Copied!', 2)}>
          <Button icon="copy" />
        </CopyToClipboard>
      </>
    )}
  </Form.Item>
);

export default CopyInput;
