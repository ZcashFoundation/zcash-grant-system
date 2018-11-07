import React from 'react';
import { connect } from 'react-redux';
import { Button, Alert } from 'antd';
import { authActions } from 'modules/auth';
import { TeamMember } from 'types';
import { AppState } from 'store/reducers';
import { AUTH_PROVIDER } from 'utils/auth';
import Identicon from 'components/Identicon';
import ShortAddress from 'components/ShortAddress';
import './SignIn.less';

interface StateProps {
  isAuthingUser: AppState['auth']['isAuthingUser'];
  authUserError: AppState['auth']['authUserError'];
}

interface DispatchProps {
  authUser: typeof authActions['authUser'];
}

interface OwnProps {
  // TODO: Use common use User type instead
  user: TeamMember;
  provider: AUTH_PROVIDER;
  reset(): void;
}

type Props = StateProps & DispatchProps & OwnProps;

class SignIn extends React.Component<Props> {
  render() {
    const { user, authUserError } = this.props;
    return (
      <div className="SignIn">
        <div className="SignIn-container">
          <div className="SignIn-identity">
            <Identicon address={user.ethAddress} className="SignIn-identity-identicon" />
            <div className="SignIn-identity-info">
              <div className="SignIn-identity-info-name">{user.name}</div>
              <code className="SignIn-identity-info-address">
                <ShortAddress address={user.ethAddress} />
              </code>
            </div>
          </div>

          <Button type="primary" size="large" block onClick={this.authUser}>
            Prove identity
          </Button>
        </div>

        {authUserError && (
          <Alert
            className="SignIn-error"
            type="error"
            message="Failed to sign in"
            description={authUserError}
            showIcon
          />
        )}

        {/*
          Temporarily only supporting web3, so there are no other identites
          <p className="SignIn-back">
            Want to use a different identity? <a onClick={this.props.reset}>Click here</a>.
          </p>
        */}
      </div>
    );
  }

  private authUser = () => {
    this.props.authUser(this.props.user.ethAddress);
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    isAuthingUser: state.auth.isAuthingUser,
    authUserError: state.auth.authUserError,
  }),
  {
    authUser: authActions.authUser,
  },
)(SignIn);
