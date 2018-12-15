import React from 'react';
import { Button, Alert, Input } from 'antd';
import { requestUserRecoveryEmail } from 'api/api';
import './AccountRecovery.less';
import Result from 'ant-design-pro/lib/Result';

const STATE = {
  email: '',
  isRecoveryPending: false,
  isRecoverySuccess: false,
  recoveryError: '',
};

type State = typeof STATE;

class AccountRecovery extends React.Component<{}, State> {
  state: State = { ...STATE };
  render() {
    const { recoveryError, isRecoveryPending, isRecoverySuccess, email } = this.state;
    return (
      <div className="AccountRecovery">
        <div className="AccountRecovery-container">
          {!isRecoverySuccess && (
            <form onSubmit={this.handleRecover}>
              <Input
                value={email}
                placeholder="email address"
                onChange={e => this.setState({ email: e.currentTarget.value })}
                size="large"
                autoComplete="email"
                type="email"
                required={true}
              />
              <Button
                htmlType="submit"
                type="primary"
                size="large"
                loading={isRecoveryPending}
                block
              >
                Send Recovery Email
              </Button>
            </form>
          )}
          {isRecoverySuccess && (
            <Result
              type="success"
              title="Please check your email for recovery instructions."
            />
          )}
        </div>

        {recoveryError && (
          <Alert
            className="AccountRecovery-error"
            type="error"
            message="Recovery failed"
            description={recoveryError}
            showIcon
          />
        )}
      </div>
    );
  }

  private handleRecover = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const { email } = this.state;
    this.setState({
      ...STATE,
      isRecoveryPending: true,
      email,
    });
    requestUserRecoveryEmail(email)
      .then(() => {
        this.setState({ isRecoveryPending: false, isRecoverySuccess: true });
      })
      .catch(e => {
        this.setState({ isRecoveryPending: false, recoveryError: e.message });
      });
  };
}

export default AccountRecovery;
