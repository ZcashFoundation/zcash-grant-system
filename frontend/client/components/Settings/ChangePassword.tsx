import React from 'react';
import { connect } from 'react-redux';
import { Form, Input, Button, Alert } from 'antd';
import { AppState } from 'store/reducers';
import { FormComponentProps } from 'antd/lib/form';
import { updateUserPassword } from 'api/api';
import './ChangePassword.less';

interface StateProps {
  authUser: AppState['auth']['user'];
}

type Props = StateProps & FormComponentProps;

class ChangePassword extends React.Component<Props> {
  state = {
    passwordConfirmDirty: false,
    passwordChangePending: false,
    passwordChangeSuccess: false,
    passwordChangeError: '',
  };

  render() {
    const {
      passwordConfirmDirty,
      passwordChangeError,
      passwordChangePending,
      passwordChangeSuccess,
    } = this.state;
    const { getFieldDecorator, validateFields, getFieldValue } = this.props.form;

    return (
      <div className="ChangePassword">
        <Form
          className="ChangePassword-form"
          onSubmit={this.handleSubmit}
          layout="horizontal"
        >
          <Form.Item>
            {getFieldDecorator('currentPassword', {
              rules: [{ required: true, message: 'Please enter your current password' }],
            })(
              <Input
                name="currentPassword"
                type="password"
                placeholder="Current password"
              />,
            )}
          </Form.Item>

          <Form.Item>
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
            })(<Input name="password" type="password" placeholder="New password" />)}
          </Form.Item>

          <Form.Item>
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
                name="passwordConfirm"
                type="password"
                onBlur={e =>
                  this.setState({
                    passwordConfirmDirty: passwordConfirmDirty || !!e.target.value,
                  })
                }
                placeholder="Confirm new password"
              />,
            )}
          </Form.Item>

          <div style={{ display: 'flex' }}>
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
              style={{ marginTop: '1rem' }}
            />
          )}

          {passwordChangeSuccess && (
            <Alert
              type="success"
              message="Password changed."
              showIcon
              closable
              onClose={() => this.setState({ passwordChangeSuccess: false })}
              style={{ marginTop: '1rem' }}
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

export default connect<StateProps, {}, {}, AppState>(state => ({
  authUser: state.auth.user,
}))(FormWrappedChangePassword);
