import React from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { updateUserPassword } from 'api/api';
import PasswordFormItems from 'components/PasswordFormItems';
import './ChangePassword.less';

type Props = FormComponentProps;

const STATE = {
  passwordChangePending: false,
  passwordChangeSuccess: false,
  passwordChangeError: '',
};

type State = typeof STATE;

class ChangePassword extends React.Component<Props, State> {
  state: State = { ...STATE };

  render() {
    const {
      passwordChangeError,
      passwordChangePending,
      passwordChangeSuccess,
    } = this.state;
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="ChangePassword">
        <Form
          className="ChangePassword-form"
          onSubmit={this.handleSubmit}
          layout="vertical"
        >
          <Form.Item label="Current password">
            {getFieldDecorator('currentPassword', {
              rules: [{ required: true, message: 'Please enter your current password' }],
            })(
              <Input
                autoComplete="current-password"
                name="currentPassword"
                type="password"
                placeholder="*********"
              />,
            )}
          </Form.Item>

          <PasswordFormItems form={this.props.form} />

          <div>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={passwordChangePending}
            >
              Change password
            </Button>
          </div>

          {passwordChangeError && (
            <Alert
              type="error"
              message={passwordChangeError}
              showIcon
              closable
              className="ChangePassword-alert"
            />
          )}

          {passwordChangeSuccess && (
            <Alert
              type="success"
              message="Password changed successfully!"
              description="We’ve sent you an email to confirm this change."
              showIcon
              closable
              onClose={() => this.setState({ passwordChangeSuccess: false })}
              className="ChangePassword-alert"
            />
          )}
        </Form>
      </div>
    );
  }

  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    this.props.form.validateFieldsAndScroll((err: any, values: any) => {
      if (!err) {
        this.setState({
          passwordChangePending: true,
          passwordChangeError: '',
          passwordChangeSuccess: false,
        });
        updateUserPassword(values.currentPassword, values.password)
          .then(() => {
            this.setState({ passwordChangePending: false, passwordChangeSuccess: true });
            this.props.form.resetFields();
          })
          .catch(e => {
            this.setState({
              passwordChangePending: false,
              passwordChangeError: e.message || e.toSring(),
            });
          });
      }
    });
  };
}

const FormWrappedChangePassword = Form.create()(ChangePassword);

export default FormWrappedChangePassword;
