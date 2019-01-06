import React from 'react';
import { Form, Input, Spin, Button, Icon, message } from 'antd';
import QRCode from 'qrcode.react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { formatZcashURI, formatZcashCLI } from 'utils/formatters';
import './PaymentInfo.scss';

export default class PaymentInfo extends React.Component {
  render() {
    const addr = 'z123';
    const memo = 'memo123';
    const amount = 123;

    // Construct URI and CLI commands
    const cli = formatZcashCLI(addr, amount, memo);
    const uri = formatZcashURI(addr, amount, memo);

    return (
      <Form className="PaymentInfo" layout="vertical">
        <p className="PaymentInfo-text">
          Thank you for contributing! Just send using whichever method works best for you,
          and we'll let you know when your contribution has been confirmed. Need help
          sending?
          {/* TODO: Help / FAQ page for sending */} <a>Click here</a>.
        </p>
        <div className="PaymentInfo-uri">
          <div className="PaymentInfo-uri-qr">
            {uri ? <QRCode value={uri} /> : <Spin />}
          </div>
          <div className="PaymentInfo-uri-info">
            <CopyInput label="Payment URI" value={uri} isTextarea />
            <Button type="ghost" size="large">
              Open in Wallet <Icon type="link" />
            </Button>
          </div>
        </div>
        <div className="PaymentInfo-fields">
          <div className="PaymentInfo-fields-row">
            <CopyInput label="Address" value={addr} />
            {memo && <CopyInput label="memo" value={memo} />}
          </div>
          <div className="PaymentInfo-fields-row">
            <CopyInput
              label="ZCash CLI command"
              help="Make sure you replace YOUR_ADDRESS with your actual address"
              value={cli}
            />
          </div>
        </div>
      </Form>
    );
  }
}

interface CopyInputProps {
  label: string;
  value: string;
  help?: string;
  isTextarea?: boolean;
}

const CopyInput: React.SFC<CopyInputProps> = ({ label, value, help, isTextarea }) => (
  <Form.Item label={label} help={help}>
    {isTextarea ? (
      <>
        <Input.TextArea value={value} readOnly rows={3} />
        <CopyToClipboard text={value} onCopy={() => message.success('Copied!', 2)}>
          <Button icon="copy" />
        </CopyToClipboard>
      </>
    ) : (
      <Input.Group>
        <Input value={value} readOnly />
        <CopyToClipboard text={value} onCopy={() => message.success('Copied!', 2)}>
          <Button icon="copy" />
        </CopyToClipboard>
      </Input.Group>
    )}
  </Form.Item>
);
