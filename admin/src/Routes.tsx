import React from 'react';
import { view } from 'react-easy-state';
import { hot } from 'react-hot-loader';
import { Switch, Route, RouteComponentProps, withRouter } from 'react-router';

import Template from 'components/Template';
import store from './store';
import Login from 'components/Login';
import Home from 'components/Home';
import Users from 'components/Users';
import Emails from 'components/Emails';
import Proposals from 'components/Proposals';

import 'styles/style.less';

type Props = RouteComponentProps<any>;

class Routes extends React.Component<Props> {
  render() {
    const { hasCheckedLogin, isLoggedIn } = store;
    if (!hasCheckedLogin) {
      return <div>checking auth status...</div>;
    }
    return (
      <Template>
        {!isLoggedIn ? (
          <Login />
        ) : (
          <Switch>
            <Route path="/" exact={true} component={Home} />
            <Route path="/users/:id?" exact={true} component={Users} />
            <Route path="/proposals/:id?" component={Proposals} />
            <Route path="/emails/:type?" component={Emails} />
          </Switch>
        )}
      </Template>
    );
  }
}

const ConnectedRoutes = withRouter(view(Routes));
export default hot(module)(ConnectedRoutes);
