import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { message } from 'antd';
import { AppState } from 'store/reducers';
import { authActions } from 'modules/auth';
import Loader from 'components/Loader';

interface OwnProps {
  onlyLoggedOut?: boolean;
}

interface StateProps {
  user: AppState['auth']['user'];
  isCheckingUser: AppState['auth']['isCheckingUser'];
  hasCheckedUser: AppState['auth']['hasCheckedUser'];
  authForwardLocation: AppState['auth']['authForwardLocation'];
}

interface DispatchProps {
  setAuthForwardLocation: typeof authActions['setAuthForwardLocation'];
}

type Props = RouteProps & StateProps & OwnProps & DispatchProps;

class AuthRoute extends React.Component<Props> {
  componentDidMount() {
    this.setAuthForward();
  }
  componentDidUpdate(prevProps: Props) {
    const { hasCheckedUser } = this.props;
    // in case we mounted before having checked user
    if (!prevProps.hasCheckedUser && hasCheckedUser) {
      this.setAuthForward();
    }
  }
  public render() {
    const {
      user,
      onlyLoggedOut,
      isCheckingUser,
      location,
      authForwardLocation,
      ...routeProps
    } = this.props;
    if (isCheckingUser) {
      return <Loader tip="Checking authentication status" />;
    }
    if ((user && !onlyLoggedOut) || (!user && onlyLoggedOut)) {
      return <Route {...routeProps} />;
    } else {
      let newLocation = { ...location, pathname: '/auth' };
      if (onlyLoggedOut) {
        newLocation = authForwardLocation || { ...location, pathname: '/profile' };
      }
      return <Redirect to={{ ...newLocation }} />;
    }
  }
  private setAuthForward = () => {
    const {
      setAuthForwardLocation,
      location,
      hasCheckedUser,
      user,
      onlyLoggedOut,
    } = this.props;
    if (hasCheckedUser && !user && !onlyLoggedOut) {
      message.warn('Authorization required.');
      setAuthForwardLocation(location);
    }
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  (state: AppState) => ({
    user: state.auth.user,
    isCheckingUser: state.auth.isCheckingUser,
    hasCheckedUser: state.auth.hasCheckedUser,
    authForwardLocation: state.auth.authForwardLocation,
  }),
  { setAuthForwardLocation: authActions.setAuthForwardLocation },
)(AuthRoute);
