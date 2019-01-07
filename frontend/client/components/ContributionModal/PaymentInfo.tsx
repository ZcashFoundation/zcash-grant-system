import React from 'react';
import classnames from 'classnames';
import { Form, Input, Spin, Button, Icon, Radio, message } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import QRCode from 'qrcode.react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { formatZcashURI, formatZcashCLI } from 'utils/formatters';
import './PaymentInfo.less';

type SendType = 'sapling' | 'transparent';

interface State {
  sendType: SendType;
}

export default class PaymentInfo extends React.Component<{}, State> {
  state: State = {
    sendType: 'sapling',
  };

  render() {
    const { sendType } = this.state;
    const addr = sendType === 'sapling'
      ? 'ztqYvtzzkSXzZvNhEVMoMxTRZyktg6ZDNB4yUx7UY17r6gTM5wpgMVfM7Ky7W2r9crro5fFtVUkkjkvNdVRiff2oDPboaTG'
      : 'tmFuUWgfhVUt4Li9nXTjgAQ69dsftDffzNq';
    const memo = sendType === 'sapling'
      ? 'memo123'
      : undefined;
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
          {/* TODO: Help / FAQ page for sending */}
          {' '}
          <a>Click here</a>.
        </p>

        <Radio.Group
          className="PaymentInfo-types"
          onChange={this.handleChangeSendType}
          value={sendType}
        >
          <Radio.Button value="sapling">
            Z Address (Private)
          </Radio.Button>
          <Radio.Button value="transparent">
            T Address (Public)
          </Radio.Button>
        </Radio.Group>

        <div className="PaymentInfo-uri">
          <div className="PaymentInfo-uri-qr">
            {uri ? <QRCode value={uri} /> : <Spin />}
          </div>
          <div className="PaymentInfo-uri-info">
            <CopyInput
              className="PaymentInfo-uri-info-input"
              label="Payment URI"
              value={uri}
              isTextarea
            />
            <Button type="ghost" size="large" href={uri} block>
              Open in Wallet <Icon type="link" />
            </Button>
          </div>
        </div>

        <div className="PaymentInfo-fields">
          <div className="PaymentInfo-fields-row">
            <CopyInput
              className="PaymentInfo-fields-row-address"
              label="Address"
              value={addr}
            />
            {memo && <CopyInput label="Memo" value={memo} />}
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

  handleChangeSendType = (ev: RadioChangeEvent) => {
    this.setState({ sendType: ev.target.value });
  };
}

interface CopyInputProps {
  label: string;
  value: string;
  className?: string;
  help?: string;
  isTextarea?: boolean;
}

const CopyInput: React.SFC<CopyInputProps> = ({ label, value, help, className, isTextarea }) => (
  <Form.Item
    className={classnames(
      'CopyInput',
      className,
      isTextarea && 'is-textarea',
    )}
    label={label}
    help={help}
  >
    {isTextarea ? (
      <>
        <Input.TextArea value={value} readOnly rows={3} />
        <CopyToClipboard text={value} onCopy={() => message.success('Copied!', 2)}>
          <Button icon="copy" />
        </CopyToClipboard>
      </>
    ) : (
      <>
        <Input value={value} readOnly />
        <CopyToClipboard text={value} onCopy={() => message.success('Copied!', 2)}>
          <Button icon="copy" />
        </CopyToClipboard>
      </>
    )}
  </Form.Item>
);
