import React from 'react';
import { connect } from 'react-redux';
import { Button, Alert, Input } from 'antd';
import { authActions } from 'modules/auth';
import { AppState } from 'store/reducers';
import { isValidEmail } from 'utils/validators';
import './SignIn.less';

interface StateProps {
  isAuthingUser: AppState['auth']['isAuthingUser'];
  authUserError: AppState['auth']['authUserError'];
}

interface DispatchProps {
  authUser: typeof authActions['authUser'];
}

type Props = StateProps & DispatchProps;

class SignIn extends React.Component<Props> {
  state = {
    password: '',
    email: '',
    isAttemptedAuth: false,
  };
  render() {
    const { authUserError, isAuthingUser } = this.props;
    const { email, password, isAttemptedAuth } = this.state;
    const valid = isValidEmail(email) && password.length > 0;
    return (
      <div className="SignIn">
        <div className="SignIn-container">
          <Input
            value={email}
            placeholder="email"
            onChange={e => this.setState({ email: e.currentTarget.value })}
            size="large"
          />
          <Input
            value={password}
            placeholder="password"
            type="password"
            onChange={e => this.setState({ password: e.currentTarget.value })}
            size="large"
          />
          <Button
            type="primary"
            size="large"
            disabled={!valid}
            loading={isAuthingUser}
            block
            onClick={() => {
              this.setState({ isAttemptedAuth: true });
              this.props.authUser(email, password);
            }}
          >
            Login
          </Button>
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
