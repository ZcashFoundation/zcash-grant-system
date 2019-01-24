import React from 'react';
import { connect } from 'react-redux';
import { Form, Input, Button, Alert } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { updateUserEmail } from 'api/api';
import { AppState } from 'store/reducers';
import './Account.less';

interface StateProps {
  email: string;
}

type Props = FormComponentProps & StateProps;

const STATE = {
  emailChangePending: false,
  emailChangeSuccess: false,
  emailChangeError: '',
};

type State = typeof STATE;

class AccountSettings extends React.Component<Props, State> {
  state: State = { ...STATE };

  render() {
    const { email, form } = this.props;
    const { emailChangeError, emailChangePending, emailChangeSuccess } = this.state;

    return (
      <div className="AccountSettings">
        <Form
          className="AccountSettings-form"
          onSubmit={this.handleSubmit}
          layout="vertical"
        >
          <Form.Item label="Email">
            {form.getFieldDecorator('email', {
              initialValue: email,
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
            {form.getFieldDecorator('currentPassword', {
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
              disabled={form.getFieldValue('email') === email}
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
              message="Email change successful!"
              description="Check your email for a confirmation link."
              showIcon
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

export default connect<StateProps, {}, {}, AppState>(state => ({
  email: state.auth.user ? state.auth.user.emailAddress || '' : '',
}))(FormWrappedAccountSettings);
