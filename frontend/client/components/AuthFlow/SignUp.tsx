import React from 'react';
import { connect } from 'react-redux';
import { Form, Input, Button, Alert } from 'antd';
import { authActions } from 'modules/auth';
import { AppState } from 'store/reducers';
import './SignUp.less';
import { FormComponentProps } from 'antd/lib/form';

interface StateProps {
  isCreatingUser: AppState['auth']['isCreatingUser'];
  createUserError: AppState['auth']['createUserError'];
}

interface DispatchProps {
  createUser: typeof authActions['createUser'];
}

type Props = StateProps & DispatchProps & FormComponentProps;

class SignUp extends React.Component<Props> {
  state = {
    passwordConfirmDirty: false,
  };

  render() {
    const { isCreatingUser, createUserError } = this.props;
    const { passwordConfirmDirty } = this.state;
    const { getFieldDecorator, validateFields, getFieldValue } = this.props.form;

    return (
      <div className="SignUp">
        <div className="SignUp-container">
          <Form className="SignUp-form" onSubmit={this.handleSubmit} layout="vertical">
            <Form.Item className="SignUp-form-item" label="Display name">
              {getFieldDecorator('name', {
                rules: [{ required: true, message: 'Please add a display name' }],
              })(
                <Input
                  name="name"
                  placeholder="Non-unique name that others will see you as"
                  size="large"
                />,
              )}
            </Form.Item>

            <Form.Item className="SignUp-form-item" label="Title">
              {getFieldDecorator('title', {
                rules: [{ required: true, message: 'Please add your title' }],
              })(
                <Input
                  name="title"
                  placeholder="A short description about you, e.g. Core Ethereum Developer"
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
                />,
              )}
            </Form.Item>

            <Form.Item className="SignUp-form-item" label="Password">
              {getFieldDecorator('password', {
                rules: [
                  { required: true, message: 'Please enter a password' },
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
                  placeholder="Enter a strong password"
                />,
              )}
            </Form.Item>

            <Form.Item className="SignUp-form-item" label="Confirm password">
              {getFieldDecorator('passwordConfirm', {
                rules: [
                  { required: true, message: 'Please confirm your password' },
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
                  name="passwordConfirm"
                  type="password"
                  onBlur={e =>
                    this.setState({
                      passwordConfirmDirty: passwordConfirmDirty || !!e.target.value,
                    })
                  }
                  placeholder="Confirm your password"
                />,
              )}
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={isCreatingUser}
            >
              Create account
            </Button>

            {createUserError && (
              <Alert
                type="error"
                message={createUserError}
                showIcon
                closable
                style={{ marginTop: '1rem' }}
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
