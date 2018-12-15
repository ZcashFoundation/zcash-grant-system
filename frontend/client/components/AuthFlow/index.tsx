import React from 'react';
import { connect } from 'react-redux';
import { Spin } from 'antd';
import { AppState } from 'store/reducers';
import { authActions } from 'modules/auth';
import SignIn from './SignIn';
import SignUp from './SignUp';
import AccountRecovery from './AccountRecovery';
import './index.less';

interface StateProps {
  authUser: AppState['auth']['user'];
  isCheckingUser: AppState['auth']['isCheckingUser'];
}

type Props = StateProps;

interface State {
  page: 'SIGN_IN' | 'SIGN_UP' | 'RECOVER';
}

export type FNOnPage = (page: State['page']) => void;

// TODO: use Nested Routing to load subpages (so we can direct link to AccountRecovery &etc)
// https://reacttraining.com/react-router/web/guides/quick-start/example-nested-routing
class AuthFlow extends React.Component<Props, State> {
  state: State = { page: 'SIGN_IN' };
  private pages = {
    SIGN_IN: {
      title: 'Sign in',
      subtitle: '',
      render: () => {
        return <SignIn onPage={this.handlePage} />;
      },
      renderSwitch: () => (
        <>
          No account?{' '}
          <a onClick={() => this.handlePage('SIGN_UP')}>Create a new account</a>.
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
          <a onClick={() => this.handlePage('SIGN_IN')}>Sign in</a>.
        </>
      ),
    },
    RECOVER: {
      title: 'Account Recovery',
      subtitle: 'Please enter your details below',
      render: () => {
        return <AccountRecovery />;
      },
      renderSwitch: () => (
        <>
          Already have an account?{' '}
          <a onClick={() => this.handlePage('SIGN_IN')}>Sign in</a>.
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

  private handlePage: FNOnPage = page => {
    this.setState({ page });
  };
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
