import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { Spin } from 'antd';
import { AppState } from 'store/reducers';

interface StateProps {
  user: AppState['auth']['user'];
  isCheckingUser: AppState['auth']['isCheckingUser'];
}

interface OwnProps {
  onlyLoggedOut?: boolean;
}

type Props = RouteProps & StateProps & OwnProps;

class AuthRoute extends React.Component<Props> {
  public render() {
    const { user, onlyLoggedOut, isCheckingUser, location, ...routeProps } = this.props;
    if (isCheckingUser) {
      return <Spin />;
    }
    if ((user && !onlyLoggedOut) || (!user && onlyLoggedOut)) {
      return <Route {...routeProps} />;
    } else {
      // TODO: redirect to desired destination after auth
      // TODO: Show alert that claims they need to be logged in
      const pathname = onlyLoggedOut ? '/profile' : '/auth';
      return <Redirect to={{ ...location, pathname }} />;
    }
  }
}

export default connect((state: AppState) => ({
  user: state.auth.user,
  isCheckingUser: state.auth.isCheckingUser,
}))(AuthRoute);
