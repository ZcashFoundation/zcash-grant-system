import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Alert, Input } from 'antd';
import { authActions } from 'modules/auth';
import { AppState } from 'store/reducers';
import './SignIn.less';

interface OwnProps {
  matchUrl: string;
}

interface StateProps {
  isAuthingUser: AppState['auth']['isAuthingUser'];
  authUserError: AppState['auth']['authUserError'];
}

interface DispatchProps {
  authUser: typeof authActions['authUser'];
}

type Props = OwnProps & StateProps & DispatchProps;

const STATE = {
  password: '',
  email: '',
  isAttemptedAuth: false,
};

type State = typeof STATE;

class SignIn extends React.Component<Props, State> {
  state: State = { ...STATE };
  render() {
    const { authUserError, isAuthingUser, matchUrl } = this.props;
    const { email, password, isAttemptedAuth } = this.state;
    return (
      <div className="SignIn">
        <div className="SignIn-container">
          <form onSubmit={this.handleLogin}>
            <Input
              value={email}
              placeholder="email"
              onChange={e => this.setState({ email: e.currentTarget.value })}
              size="large"
              autoComplete="email"
              required={true}
            />
            <Input
              value={password}
              placeholder="password"
              type="password"
              onChange={e => this.setState({ password: e.currentTarget.value })}
              size="large"
              autoComplete="current-password"
              required={true}
            />
            <Button
              type="primary"
              size="large"
              loading={isAuthingUser}
              htmlType="submit"
              block
            >
              Sign in
            </Button>
            <div className="SignIn-container-bottom">
              Forgot your password?{' '}
              <Link to={`${matchUrl}/recover`}>Recover your account</Link>.
            </div>
          </form>
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

  private handleLogin = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
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
