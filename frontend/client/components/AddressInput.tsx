import React from 'react';
import classnames from 'classnames';
import { Form, Input } from 'antd';
import { InputProps } from 'antd/lib/input';
import { FormItemProps } from 'antd/lib/form';
import { isValidAddress } from 'utils/validators';
import Identicon from 'components/Identicon';
import { DONATION } from 'utils/constants';
import './AddressInput.less';

export interface Props {
  value: string | undefined;
  className?: string;
  showIdenticon?: boolean;
  inputProps?: InputProps;
  formItemProps?: FormItemProps;
  onChange(ev: React.ChangeEvent<HTMLInputElement>): void;
}

export default class AddressInput extends React.Component<Props> {
  render() {
    const { value, onChange, className, showIdenticon } = this.props;
    const passedFormItemProps = this.props.formItemProps || {};
    const passedInputProps = this.props.inputProps || {};
    const isInvalid = value && !isValidAddress(value);

    const formItemProps = {
      validateStatus: (isInvalid
        ? 'error'
        : undefined) as FormItemProps['validateStatus'],
      help: isInvalid ? 'Address is invalid' : undefined,
      ...passedFormItemProps,
      className: classnames('AddressInput', className, passedFormItemProps.className),
    };

    const inputProps = {
      placeholder: DONATION.ETH,
      prefix: value &&
        showIdenticon && (
          <Identicon className="AddressInput-input-identicon" address={value} />
        ),
      ...passedInputProps,
      value,
      onChange,
      className: classnames(
        'AddressInput-input',
        className && `${className}-input`,
        passedInputProps.className,
      ),
    };

    return (
      <Form.Item {...formItemProps}>
        <Input {...inputProps} />
      </Form.Item>
    );
  }
}
