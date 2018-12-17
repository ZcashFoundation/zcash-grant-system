import React from 'react';
import { Button, Form, Alert } from 'antd';
import qs from 'query-string';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import Result from 'ant-design-pro/lib/Result';
import { resetPassword } from 'api/api';
import { FormComponentProps } from 'antd/lib/form';
import PasswordFormItems from 'components/PasswordFormItems';
import './index.less';

type Props = RouteComponentProps & FormComponentProps;

interface State {
  passwordConfirmDirty: boolean;
  isResetting: boolean;
  resetSuccess: boolean;
  error: string;
}

class PasswordReset extends React.Component<Props, State> {
  state: State = {
    passwordConfirmDirty: false,
    isResetting: false,
    resetSuccess: false,
    error: '',
  };

  render() {
    const { isResetting, resetSuccess, error } = this.state;

    const resetForm = (
      <Form className="PasswordReset-form" onSubmit={this.handleSubmit}>
        <PasswordFormItems form={this.props.form} />
        <div className="PasswordReset-form-controls">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={isResetting}
          >
            Change password
          </Button>
        </div>
      </Form>
    );

    const success = (
      <Result
        type="success"
        title="Password has been reset"
        actions={
          <div>
            <Link to="/auth">
              <Button size="large" type="primary">
                Sign in
              </Button>
            </Link>
            <Link to="/">
              <Button size="large" type="default">
                Return Home
              </Button>
            </Link>
          </div>
        }
      />
    );

    return (
      <div className="PasswordReset">
        <h1>Reset Password</h1>
        {resetSuccess ? success : resetForm}
        {error && <Alert type="error" message={error} showIcon closable />}
        {error && (
          <div className="PasswordReset-bottom">
            Having problems?{' '}
            <Link to="/auth/recover">Request a new password recovery code</Link>.
          </div>
        )}
      </div>
    );
  }

  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    this.props.form.validateFieldsAndScroll((err: any, values: any) => {
      if (!err) {
        const args = qs.parse(this.props.location.search);
        this.setState({ isResetting: true, error: '' });
        resetPassword(args.code, values.password)
          .then(() => {
            this.setState({
              isResetting: false,
              resetSuccess: true,
            });
          })
          .catch(e => {
            this.setState({
              error: e.message || e.toString(),
              isResetting: false,
            });
          });
      }
    });
  };
}

export default Form.create()(withRouter(PasswordReset));
