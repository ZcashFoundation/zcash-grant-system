import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps, Redirect } from 'react-router';
import { Switch, Route, Link } from 'react-router-dom';
import { Spin } from 'antd';
import { AppState } from 'store/reducers';
import { authActions } from 'modules/auth';
import Exception from 'pages/exception';
import SignIn from './SignIn';
import SignUp from './SignUp';
import AccountRecovery from './AccountRecovery';
import './index.less';

interface StateProps {
  authUser: AppState['auth']['user'];
  isCheckingUser: AppState['auth']['isCheckingUser'];
}

type Props = StateProps & RouteComponentProps<any>;

class AuthFlow extends React.Component<Props> {
  renderRecover = () => (
    <>
      <h1 className="AuthFlow-title">Account Recovery</h1>
      <p className="AuthFlow-subtitle">Please enter your details below</p>
      <div className="AuthFlow-content">
        <AccountRecovery />
      </div>
      <div className="AuthFlow-bottom">
        Already have an account?{' '}
        <Link to={`${this.props.match.url}/sign-in`}>Sign in</Link>.
      </div>
    </>
  );

  renderSignUp = () => (
    <>
      <h1 className="AuthFlow-title">Create your Account</h1>
      <p className="AuthFlow-subtitle">Please enter your details below</p>
      <div className="AuthFlow-content">
        <SignUp />
      </div>
      <div className="AuthFlow-bottom">
        Already have an account?{' '}
        <Link to={`${this.props.match.url}/sign-in`}>Sign in</Link>.
      </div>
    </>
  );

  renderSignIn = () => (
    <>
      <h1 className="AuthFlow-title">Sign in</h1>
      <div className="AuthFlow-content">
        <SignIn matchUrl={this.props.match.url} />
      </div>
      <div className="AuthFlow-bottom">
        No account?{' '}
        <Link to={`${this.props.match.url}/sign-up`}>Create a new account</Link>.
      </div>
    </>
  );

  render() {
    const { isCheckingUser, match } = this.props;

    if (isCheckingUser) {
      return <Spin size="large" />;
    }

    return (
      <div className="AuthFlow">
        <Switch>
          <Route
            exact={true}
            path={`${match.path}`}
            render={() => <Redirect to={`${match.path}/sign-in`} />}
          />
          <Route path={`${match.path}/sign-in`} render={this.renderSignIn} />
          <Route path={`${match.path}/sign-up`} render={this.renderSignUp} />
          <Route path={`${match.path}/recover`} render={this.renderRecover} />
          <Route render={() => <Exception code="404" />} />
        </Switch>
      </div>
    );
  }
}

const withConnect = connect<StateProps, {}, {}, AppState>(
  state => ({
    authUser: state.auth.user,
    isCheckingUser: state.auth.isCheckingUser,
  }),
  {
    checkUser: authActions.checkUser,
  },
);

export default compose<Props, {}>(
  withRouter,
  withConnect,
)(AuthFlow);
