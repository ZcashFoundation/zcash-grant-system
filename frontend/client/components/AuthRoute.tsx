import React from 'react';
import { connect } from 'react-redux';
import { Spin } from 'antd';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { AppState } from 'store/reducers';

interface StateProps {
  user: AppState['auth']['user'];
  isAuthingUser: AppState['auth']['isAuthingUser'];
}

interface OwnProps {
  onlyLoggedOut?: boolean;
}

type Props = RouteProps & StateProps & OwnProps;

class AuthRoute extends React.Component<Props> {
  public render() {
    const { user, isAuthingUser, onlyLoggedOut, ...routeProps } = this.props;

    if (isAuthingUser) {
      return <Spin size="large" />;
    } else if ((user && !onlyLoggedOut) || (!user && onlyLoggedOut)) {
      return <Route {...routeProps} />;
    } else {
      // TODO: redirect to desired destination after auth
      // TODO: Show alert that claims they need to be logged in
      return <Redirect to={onlyLoggedOut ? '/profile' : '/auth'} />;
    }
  }
}

export default connect((state: AppState) => ({
  user: state.auth.user,
  isAuthingUser: state.auth.isAuthingUser,
}))(AuthRoute);
