import React from 'react';
import { connect } from 'react-redux';
import { Form, Input, Button, Checkbox, Alert } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { authActions } from 'modules/auth';
import { AppState } from 'store/reducers';
import PasswordFormItems from 'components/PasswordFormItems';
import './SignUp.less';
import { Link } from 'react-router-dom';

interface StateProps {
  isCreatingUser: AppState['auth']['isCreatingUser'];
  createUserError: AppState['auth']['createUserError'];
}

interface DispatchProps {
  createUser: typeof authActions['createUser'];
}

type Props = StateProps & DispatchProps & FormComponentProps;

class SignUp extends React.Component<Props> {
  render() {
    const { isCreatingUser, createUserError } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="SignUp">
        <div className="SignUp-container">
          <Form className="SignUp-form" onSubmit={this.handleSubmit}>
            <Form.Item className="SignUp-form-item" label="Display name">
              {getFieldDecorator('name', {
                rules: [{ required: true, message: 'Please add a display name' }],
              })(
                <Input
                  name="name"
                  placeholder="Non-unique name that others will see you as"
                  autoComplete="name"
                  maxLength={50}
                />,
              )}
            </Form.Item>

            <Form.Item className="SignUp-form-item" label="About you">
              {getFieldDecorator('title', {
                rules: [{ required: true, message: 'Please add your title' }],
              })(
                <Input
                  name="title"
                  placeholder="A short description about you, e.g. Core Ethereum Developer"
                  maxLength={50}
                />,
              )}
            </Form.Item>

            <Form.Item className="SignUp-form-item" label="Email address">
              {getFieldDecorator('email', {
                rules: [
                  { type: 'email', message: 'Invalid email' },
                  { required: true, message: 'Please enter your email' },
                ],
              })(
                <Input
                  name="email"
                  placeholder="We promise not to spam you or share your email"
                  autoComplete="username"
                  maxLength={255}
                />,
              )}
            </Form.Item>

            <PasswordFormItems form={this.props.form} />

            <Form.Item className="SignUp-form-legal">
              {getFieldDecorator('hasAgreed', {
                rules: [
                  { required: true, message: 'You must agree to create an account' },
                ],
              })(
                <Checkbox name="hasAgreed">
                  <span className="SignUp-form-legal-text">
                    I agree to the{' '}
                    <Link target="_blank" to="/code-of-conduct">
                      code of conduct
                    </Link>
                    ,{' '}
                    <Link target="_blank" to="/tos">
                      terms of service
                    </Link>
                    , and{' '}
                    <Link target="_blank" to="/privacy">
                      privacy policy
                    </Link>
                    .
                  </span>
                </Checkbox>,
              )}
            </Form.Item>

            <div className="SignUp-form-controls">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={isCreatingUser}
              >
                Create account
              </Button>
            </div>
            {createUserError && (
              <Alert
                type="error"
                message={createUserError}
                showIcon
                closable
                className="SignUp-form-alert"
              />
            )}
          </Form>
        </div>
      </div>
    );
  }

  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const { createUser } = this.props;
    this.props.form.validateFieldsAndScroll((err: any, values: any) => {
      if (!err) {
        delete values.passwordConfirm;
        createUser(values);
      }
    });
  };
}

const FormWrappedSignUp = Form.create()(SignUp);

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    isCreatingUser: state.auth.isCreatingUser,
    createUserError: state.auth.createUserError,
  }),
  {
    createUser: authActions.createUser,
  },
)(FormWrappedSignUp);
