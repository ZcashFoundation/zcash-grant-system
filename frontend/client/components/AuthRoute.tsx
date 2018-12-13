import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { AppState } from 'store/reducers';

interface StateProps {
  user: AppState['auth']['user'];
}

interface OwnProps {
  onlyLoggedOut?: boolean;
}

type Props = RouteProps & StateProps & OwnProps;

class AuthRoute extends React.Component<Props> {
  public render() {
    const { user, onlyLoggedOut, ...routeProps } = this.props;
    if ((user && !onlyLoggedOut) || (!user && onlyLoggedOut)) {
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
}))(AuthRoute);
