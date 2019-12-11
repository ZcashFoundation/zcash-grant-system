import React from 'react';
import { connect } from 'react-redux';
import { Redirect, RouteProps } from 'react-router';
import { Button } from 'antd';
import { AppState } from 'store/reducers';
import { authActions } from 'modules/auth';
import { NativeButtonProps } from 'antd/lib/button/button';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

type OwnProps = NativeButtonProps;

interface StateProps {
  user: AppState['auth']['user'];
}

interface DispatchProps {
  setAuthForwardLocation: typeof authActions['setAuthForwardLocation'];
}

type Props = OwnProps & RouteProps & StateProps & DispatchProps;

const STATE = {
  sendToAuth: false,
};
type State = typeof STATE;

class AuthButton extends React.Component<Props, State> {
  state: State = { ...STATE };
  public render() {
    const { location, children, loading } = this.props;
    if (this.state.sendToAuth) {
      return <Redirect to={{ ...location, pathname: '/profile' }} />;
    }
    return (
      <Button loading={loading} onClick={this.handleClick}>
        {children}
      </Button>
    );
  }
  private handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!this.props.onClick) {
      return;
    }
    if (this.props.user) {
      this.props.onClick(e);
    } else {
      const { location, setAuthForwardLocation } = this.props;
      setAuthForwardLocation(location);
      setTimeout(() => {
        this.setState({ sendToAuth: true });
      }, 200);
    }
  };
}

const withConnect = connect<StateProps, DispatchProps, OwnProps, AppState>(
  (state: AppState) => ({
    user: state.auth.user,
  }),
  { setAuthForwardLocation: authActions.setAuthForwardLocation },
);

export default compose<Props, OwnProps>(
  withRouter,
  withConnect,
)(AuthButton);
