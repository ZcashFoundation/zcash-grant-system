import React from 'react';
import { Button, Alert, Input } from 'antd';
import { isValidEmail } from 'utils/validators';
import { requestUserRecoveryEmail } from 'api/api';
import './AccountRecovery.less';
import Result from 'ant-design-pro/lib/Result';

class AccountRecovery extends React.Component {
  INITIAL_STATE = {
    email: '',
    isRecoveryPending: false,
    isRecoverySuccess: false,
    recoveryError: '',
  };
  state = { ...this.INITIAL_STATE };
  render() {
    const { recoveryError, isRecoveryPending, isRecoverySuccess, email } = this.state;
    return (
      <div className="AccountRecovery">
        <div className="AccountRecovery-container">
          {!isRecoverySuccess && (
            <>
              <Input
                value={email}
                placeholder="email"
                onChange={e => this.setState({ email: e.currentTarget.value })}
                size="large"
                autoComplete="email"
                onPressEnter={this.handleRecover}
              />
              <Button
                type="primary"
                size="large"
                disabled={!this.isValid()}
                loading={isRecoveryPending}
                block
                onClick={this.handleRecover}
              >
                Send Recovery Email
              </Button>
            </>
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

  private isValid = () => {
    const { email } = this.state;
    return isValidEmail(email);
  };

  private handleRecover = () => {
    if (!this.isValid()) {
      return;
    }
    const { email } = this.state;
    this.setState({
      ...this.INITIAL_STATE,
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
