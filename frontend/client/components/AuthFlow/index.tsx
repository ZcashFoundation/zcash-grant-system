import React from 'react';
import { connect } from 'react-redux';
import { Spin } from 'antd';
import { AppState } from 'store/reducers';
import { authActions } from 'modules/auth';
import SignIn from './SignIn';
import SignUp from './SignUp';
import './index.less';

interface StateProps {
  authUser: AppState['auth']['user'];
  isCheckingUser: AppState['auth']['isCheckingUser'];
}

type Props = StateProps;

class AuthFlow extends React.Component<Props> {
  state: { page: 'SIGN_IN' | 'SIGN_UP' } = { page: 'SIGN_IN' };
  private pages = {
    SIGN_IN: {
      title: 'Sign in',
      subtitle: '',
      render: () => {
        return <SignIn />;
      },
      renderSwitch: () => (
        <>
          No account?{' '}
          <a onClick={() => this.setState({ page: 'SIGN_UP' })}>Create an new account</a>.
        </>
      ),
    },
    SIGN_UP: {
      title: 'Create your Account',
      subtitle: 'Please enter your details below',
      render: () => {
        return <SignUp />;
      },
      renderSwitch: () => (
        <>
          Already have an account?{' '}
          <a onClick={() => this.setState({ page: 'SIGN_IN' })}>Sign in</a>.
        </>
      ),
    },
  };

  render() {
    const { isCheckingUser } = this.props;
    const page = this.pages[this.state.page];

    if (isCheckingUser) {
      return <Spin size="large" />;
    }

    return (
      <div className="AuthFlow">
        {page.title && <h1 className="AuthFlow-title">{page.title}</h1>}
        {page.subtitle && <p className="AuthFlow-subtitle">{page.subtitle}</p>}
        <div className="AuthFlow-content">{page.render()}</div>
        <div className="AuthFlow-switch">{page.renderSwitch()}</div>
      </div>
    );
  }
}

export default connect<StateProps, {}, {}, AppState>(
  state => ({
    authUser: state.auth.user,
    isCheckingUser: state.auth.isCheckingUser,
  }),
  {
    checkUser: authActions.checkUser,
  },
)(AuthFlow);
