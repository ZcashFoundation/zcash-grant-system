import React from 'react';
import { Input, Button, Form, Row, Col, Alert } from 'antd';
import qs from 'query-string';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import Result from 'ant-design-pro/lib/Result';
import { resetPassword } from 'api/api';
import { FormComponentProps } from 'antd/lib/form';
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
    const { isResetting, resetSuccess, error, passwordConfirmDirty } = this.state;
    const { getFieldDecorator, getFieldValue, validateFields } = this.props.form;

    const resetForm = (
      <Form className="PasswordReset-form" onSubmit={this.handleSubmit} layout="vertical">
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="New password">
              {getFieldDecorator('password', {
                rules: [
                  { required: true, message: 'Please enter a new password' },
                  { min: 8, message: 'Please use at least 8 characters' },
                  {
                    validator: (_, val, cb) => {
                      if (val && passwordConfirmDirty) {
                        validateFields(['passwordConfirm'], { force: true });
                      }
                      cb();
                    },
                  },
                ],
              })(
                <Input
                  name="password"
                  type="password"
                  placeholder="password"
                  autoComplete="new-password"
                />,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Confirm password">
              {getFieldDecorator('passwordConfirm', {
                rules: [
                  { required: true, message: 'Please confirm new password' },
                  {
                    validator: (_, val, cb) => {
                      if (val && val !== getFieldValue('password')) {
                        cb('Passwords do not match');
                      } else {
                        cb();
                      }
                    },
                  },
                ],
              })(
                <Input
                  autoComplete="off"
                  name="passwordConfirm"
                  type="password"
                  onBlur={e =>
                    this.setState({
                      passwordConfirmDirty: passwordConfirmDirty || !!e.target.value,
                    })
                  }
                  placeholder="confirm password"
                />,
              )}
            </Form.Item>
          </Col>
        </Row>
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
