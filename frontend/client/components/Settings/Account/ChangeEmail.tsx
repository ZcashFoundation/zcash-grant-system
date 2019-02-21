import React from 'react';
import { connect } from 'react-redux';
import { Form, Input, Button, Alert, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import Loader from 'components/Loader';
import { updateUserEmail, resendEmailVerification } from 'api/api';
import { AppState } from 'store/reducers';
import './ChangeEmail.less';

interface StateProps {
  email: string;
  emailVerified: boolean;
}

type Props = FormComponentProps & StateProps;

const STATE = {
  newEmail: '',
  emailChangePending: false,
  emailChangeSuccess: false,
  emailChangeError: '',
  isResendingVerification: false,
  hasResentVerification: false,
};

type State = typeof STATE;

class ChangeEmail extends React.Component<Props, State> {
  state: State = { ...STATE };

  render() {
    const { email, emailVerified, form } = this.props;
    const {
      emailChangeError,
      emailChangePending,
      emailChangeSuccess,
      newEmail,
      isResendingVerification,
      hasResentVerification,
    } = this.state;

    return (
      <Form className="ChangeEmail" onSubmit={this.handleSubmit} layout="vertical">
        {!emailVerified &&
          !hasResentVerification && (
            <Alert
              showIcon
              className="ChangeEmail-form-resend"
              type="warning"
              message="Your email has not been verified"
              description={
                <>
                  You should have a verification in your inbox. If you can't find it,
                  check your spam folder. Still don't see it?{' '}
                  <a onClick={this.resendEmailVerification}>Click here to resend</a>.
                  {isResendingVerification && <Loader overlay />}
                </>
              }
            />
          )}
        {!emailVerified &&
          hasResentVerification && (
            <Alert
              showIcon
              className="ChangeEmail-form-resend"
              type="success"
              message="Verification has been sent"
              description={`
              It should be in your inbox shortly. If you don’t see it soon,
              check your spam folder or contact support for help.
            `}
            />
          )}
        <Form.Item label="Email">
          {form.getFieldDecorator('email', {
            initialValue: newEmail || email,
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
            className="ChangeEmail-alert"
          />
        )}

        {emailChangeSuccess && (
          <Alert
            type="success"
            message="Email change successful!"
            description="Check your email for a confirmation link."
            showIcon
            onClose={() => this.setState({ emailChangeSuccess: false })}
            className="ChangeEmail-alert"
          />
        )}
      </Form>
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
            this.setState(
              {
                newEmail: values.email,
                emailChangePending: false,
                emailChangeSuccess: true,
              },
              () => {
                this.props.form.resetFields();
              },
            );
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

  private resendEmailVerification = async () => {
    if (this.state.isResendingVerification) {
      return;
    }
    this.setState({ isResendingVerification: true });
    try {
      await resendEmailVerification();
      this.setState({ hasResentVerification: true });
    } catch (err) {
      message.error(err.message || err.toString());
    }
    this.setState({ isResendingVerification: false });
  };
}

const FormWrappedChangeEmail = Form.create()(ChangeEmail);

export default connect<StateProps, {}, {}, AppState>(state => ({
  email: state.auth.user ? state.auth.user.emailAddress || '' : '',
  emailVerified: !!state.auth.user && !!state.auth.user.emailVerified,
}))(FormWrappedChangeEmail);
