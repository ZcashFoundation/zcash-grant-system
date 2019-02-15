import React, { ReactNode } from 'react';
import { Modal, Input, Button } from 'antd';
import { ModalFuncProps } from 'antd/lib/modal';
import TextArea from 'antd/lib/input/TextArea';
import './index.less';

interface OpenProps extends ModalFuncProps {
  label: ReactNode;
  onOk: (feedback: string) => void;
}

const open = (p: OpenProps) => {
  // NOTE: display=none antd buttons and using our own to control things more
  const ref = { text: '' };
  const { label, content, okText, cancelText, ...rest } = p;
  const modal = Modal.confirm({
    maskClosable: true,
    icon: <></>,
    className: 'FeedbackModal',
    content: (
      <Feedback
        label={label}
        content={content}
        okText={okText}
        cancelText={cancelText}
        onCancel={() => {
          modal.destroy();
        }}
        onOk={() => {
          modal.destroy();
          p.onOk(ref.text);
        }}
        onChange={(t: string) => (ref.text = t)}
      />
    ),
    ...rest,
  });
};

// Feedback content
interface OwnProps {
  onChange: (t: string) => void;
  label: ReactNode;
  onOk: ModalFuncProps['onOk'];
  onCancel: ModalFuncProps['onCancel'];
  okText?: ReactNode;
  cancelText?: ReactNode;
  content?: ReactNode;
}

type Props = OwnProps;

const STATE = {
  text: '',
};

type State = typeof STATE;

class Feedback extends React.Component<Props, State> {
  state = STATE;
  input: null | TextArea = null;
  componentDidMount() {
    if (this.input) this.input.focus();
  }
  render() {
    const { text } = this.state;
    const { label, onOk, onCancel, content, okText, cancelText } = this.props;
    return (
      <div>
        {content && <p>{content}</p>}
        <div className="FeedbackModal-label">{label}</div>
        <Input.TextArea
          ref={ta => (this.input = ta)}
          rows={4}
          required={true}
          value={text}
          onChange={e => {
            this.setState({ text: e.target.value });
            this.props.onChange(e.target.value);
          }}
        />
        <div className="FeedbackModal-controls">
          <Button onClick={onCancel}>{cancelText || 'Cancel'}</Button>
          <Button onClick={onOk} disabled={text.length === 0} type="primary">
            {okText || 'Ok'}
          </Button>
        </div>
      </div>
    );
  }
}

export default { open };
