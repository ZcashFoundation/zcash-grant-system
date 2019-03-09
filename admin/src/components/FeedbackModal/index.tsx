import React, { ReactNode } from 'react';
import { Modal, Input, Button } from 'antd';
import { ModalFuncProps } from 'antd/lib/modal';
import TextArea, { TextAreaProps } from 'antd/lib/input/TextArea';
import { InputProps } from 'antd/lib/input';
import './index.less';

interface OpenProps extends ModalFuncProps {
  label?: ReactNode;
  inputProps?: InputProps;
  textAreaProps?: TextAreaProps;
  type?: 'textArea' | 'input';
  onOk: (feedback: string) => void;
}

const open = (p: OpenProps) => {
  // NOTE: display=none antd buttons and using our own to control things more
  const ref = { text: '' };
  const {
    label,
    content,
    type,
    inputProps,
    textAreaProps,
    okText,
    cancelText,
    ...rest
  } = p;
  const modal = Modal.confirm({
    maskClosable: true,
    icon: <></>,
    className: 'FeedbackModal',
    content: (
      <Feedback
        label={label}
        content={content}
        type={type || 'textArea'}
        inputProps={inputProps}
        textAreaProps={textAreaProps}
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
  label?: ReactNode;
  type: 'textArea' | 'input';
  inputProps?: InputProps;
  textAreaProps?: TextAreaProps;
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
  input: null | TextArea | Input = null;
  componentDidMount() {
    if (this.input) this.input.focus();
  }
  render() {
    const { text } = this.state;
    const {
      label,
      type,
      textAreaProps,
      inputProps,
      onOk,
      onCancel,
      content,
      okText,
      cancelText,
    } = this.props;
    return (
      <div>
        {content && <p>{content}</p>}
        {label && <div className="FeedbackModal-label">{label}</div>}
        {type === 'textArea' && (
          <Input.TextArea
            ref={ta => (this.input = ta)}
            rows={4}
            required={true}
            value={text}
            onChange={e => {
              this.setState({ text: e.target.value });
              this.props.onChange(e.target.value);
            }}
            {...textAreaProps}
          />
        )}
        {type === 'input' && (
          <Input
            ref={ta => (this.input = ta)}
            value={text}
            onChange={e => {
              this.setState({ text: e.target.value });
              this.props.onChange(e.target.value);
            }}
            {...inputProps}
          />
        )}
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
