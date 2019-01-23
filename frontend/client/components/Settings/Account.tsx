import React from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { updateUserEmail } from 'api/api';
import './Account.less';

type Props = FormComponentProps;

const STATE = {
  emailChangePending: false,
  emailChangeSuccess: false,
  emailChangeError: '',
};

type State = typeof STATE;

class AccountSettings extends React.Component<Props, State> {
  state: State = { ...STATE };

  render() {
    const { emailChangeError, emailChangePending, emailChangeSuccess } = this.state;
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="AccountSettings">
        <Form
          className="AccountSettings-form"
          onSubmit={this.handleSubmit}
          layout="vertical"
        >
          <Form.Item label="Email">
            {getFieldDecorator('email', {
              rules: [
                { type: 'email', message: 'Please enter a valid email' },
                { required: true, message: 'Please enter a new email' },
              ],
            })(
              <Input
                autoComplete="off"
                name="email"
                type="email"
                placeholder="example@email.com"
              />,
            )}
          </Form.Item>

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

          <div>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={emailChangePending}
            >
              Change email
            </Button>
          </div>

          {emailChangeError && (
            <Alert
              type="error"
              message={emailChangeError}
              showIcon
              closable
              className="AccountSettings-alert"
            />
          )}

          {emailChangeSuccess && (
            <Alert
              type="success"
              message="Email changed."
              description="Check your email for a confirmation. Your account will be limited until you do this."
              showIcon
              closable
              onClose={() => this.setState({ emailChangeSuccess: false })}
              className="AccountSettings-alert"
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
          emailChangePending: true,
          emailChangeError: '',
          emailChangeSuccess: false,
        });
        updateUserEmail(values.email, values.currentPassword)
          .then(() => {
            this.setState({
              emailChangePending: false,
              emailChangeSuccess: true,
            });
            this.props.form.resetFields();
          })
          .catch(e => {
            this.setState({
              emailChangePending: false,
              emailChangeError: e.message || e.toSring(),
            });
          });
      }
    });
  };
}

const FormWrappedAccountSettings = Form.create()(AccountSettings);

export default FormWrappedAccountSettings;
