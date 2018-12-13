import React from 'react';
import { connect } from 'react-redux';
import { Button, Alert, Input } from 'antd';
import { authActions } from 'modules/auth';
import { AppState } from 'store/reducers';
import { isValidEmail } from 'utils/validators';
import './SignIn.less';
import { FNOnPage } from '.';

interface OwnProps {
  onPage: FNOnPage;
}

interface StateProps {
  isAuthingUser: AppState['auth']['isAuthingUser'];
  authUserError: AppState['auth']['authUserError'];
}

interface DispatchProps {
  authUser: typeof authActions['authUser'];
}

type Props = OwnProps & StateProps & DispatchProps;

class SignIn extends React.Component<Props> {
  state = {
    password: '',
    email: '',
    isAttemptedAuth: false,
  };
  render() {
    const { authUserError, isAuthingUser } = this.props;
    const { email, password, isAttemptedAuth } = this.state;
    return (
      <div className="SignIn">
        <div className="SignIn-container">
          <Input
            value={email}
            placeholder="email"
            onChange={e => this.setState({ email: e.currentTarget.value })}
            size="large"
            autoComplete="email"
          />
          <Input
            value={password}
            placeholder="password"
            type="password"
            onChange={e => this.setState({ password: e.currentTarget.value })}
            size="large"
            autoComplete="current-password"
            onPressEnter={this.handleLogin}
          />
          <Button
            type="primary"
            size="large"
            disabled={!this.isValid()}
            loading={isAuthingUser}
            block
            onClick={this.handleLogin}
          >
            Sign in
          </Button>
          <div className="SignIn-container-bottom">
            Forgot your password?{' '}
            <a onClick={() => this.props.onPage('RECOVER')}>Recover your account</a>.
          </div>
        </div>

        {isAttemptedAuth &&
          authUserError && (
            <Alert
              className="SignIn-error"
              type="error"
              message="Failed to sign in"
              description={authUserError}
              showIcon
            />
          )}
      </div>
    );
  }

  private isValid = () => {
    const { email, password } = this.state;
    return isValidEmail(email) && password.length > 0;
  };

  private handleLogin = () => {
    if (!this.isValid()) {
      return;
    }
    const { email, password } = this.state;
    this.setState({ isAttemptedAuth: true });
    this.props.authUser(email, password);
  };
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    isAuthingUser: state.auth.isAuthingUser,
    authUserError: state.auth.authUserError,
  }),
  {
    authUser: authActions.authUser,
  },
)(SignIn);
