import React from 'react';
import { connect } from 'react-redux';
import { Spin } from 'antd';
import { AppState } from 'store/reducers';
import { AUTH_PROVIDER } from 'utils/auth';
import { authActions } from 'modules/auth';
import SignIn from './SignIn';
import SignUp from './SignUp';
import SelectProvider from './SelectProvider';
import ProvideIdentity from './ProvideIdentity';
import './index.less';

interface StateProps {
  checkedUsers: AppState['auth']['checkedUsers'];
  isCheckingUser: AppState['auth']['isCheckingUser'];
}

interface DispatchProps {
  checkUser: typeof authActions['checkUser'];
}

type Props = StateProps & DispatchProps;

interface State {
  provider: AUTH_PROVIDER | null;
  address: string | null;
}

const DEFAULT_STATE: State = {
  // Temporarily hardcode to web3, change to null when others are supported
  provider: AUTH_PROVIDER.ADDRESS,
  address: null,
};

class AuthFlow extends React.Component<Props> {
  state: State = { ...DEFAULT_STATE };

  private pages = {
    SIGN_IN: {
      title: () => 'Prove your Identity',
      subtitle: () => 'Log into your Grant.io account by proving your identity',
      render: () => {
        const { address, provider } = this.state;
        const user = address && this.props.checkedUsers[address];
        return (
          user &&
          provider && <SignIn provider={provider} user={user} reset={this.resetState} />
        );
      },
    },
    SIGN_UP: {
      title: () => 'Claim your Identity',
      subtitle: () => 'Create a Grant.io account by claiming your identity',
      render: () => {
        const { address, provider } = this.state;
        return (
          address &&
          provider && (
            <SignUp address={address} provider={provider} reset={this.resetState} />
          )
        );
      },
    },
    SELECT_PROVIDER: {
      title: () => 'Provide an Identity',
      subtitle: () =>
        'Sign in or create a new account by selecting your identity provider',
      render: () => <SelectProvider onSelect={this.setProvider} />,
    },
    PROVIDE_IDENTITY: {
      title: () => 'Provide an Identity',
      subtitle: () => {
        switch (this.state.provider) {
          case AUTH_PROVIDER.ADDRESS:
            return 'Enter your Ethereum Address';
        }
      },
      render: () => {
        return (
          this.state.provider && (
            <ProvideIdentity
              provider={this.state.provider}
              onSelectAddress={this.setAddress}
              reset={this.resetState}
            />
          )
        );
      },
    },
  };

  componentDidMount() {
    console.warn('TODO - initialize authorization');
    // If web3 is available, default to it
    // const { web3Accounts } = this.props;
    // if (web3Accounts && web3Accounts[0]) {
    //   this.setState({
    //     provider: AUTH_PROVIDER.WEB3,
    //     address: web3Accounts[0],
    //   });
    //   this.props.checkUser(web3Accounts[0]);
    // }
  }

  render() {
    const { checkedUsers, isCheckingUser } = this.props;
    const { provider, address } = this.state;
    const checkedUser = address && checkedUsers[address];
    let page;

    if (provider) {
      if (address) {
        // TODO: If address results in user, show SIGN_IN.
        if (isCheckingUser) {
          return <Spin size="large" />;
        } else if (checkedUser) {
          page = this.pages.SIGN_IN;
        } else {
          page = this.pages.SIGN_UP;
        }
      } else {
        page = this.pages.PROVIDE_IDENTITY;
      }
    } else {
      page = this.pages.SELECT_PROVIDER;
    }

    return (
      <div className="AuthFlow">
        <h1 className="AuthFlow-title">{page.title()}</h1>
        <p className="AuthFlow-subtitle">{page.subtitle()}</p>
        <div className="AuthFlow-content">{page.render()}</div>
      </div>
    );
  }

  private setProvider = (provider: AUTH_PROVIDER) => {
    this.setState({ provider });
  };

  private setAddress = (address: string) => {
    this.setState({ address });
    this.props.checkUser(address);
  };

  private resetState = () => {
    this.setState({ ...DEFAULT_STATE });
  };
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    checkedUsers: state.auth.checkedUsers,
    isCheckingUser: state.auth.isCheckingUser,
  }),
  {
    checkUser: authActions.checkUser,
  },
)(AuthFlow);
