import React from 'react';
import { hot } from 'react-hot-loader';
import { Switch, Route } from 'react-router';
import loadable from 'loadable-components';
import AuthRoute from 'components/AuthRoute';

// wrap components in loadable...import & they will be split
const Home = loadable(() => import('pages/index'));
const Create = loadable(() => import('pages/create'));
const Proposals = loadable(() => import('pages/proposals'));
const Proposal = loadable(() => import('pages/proposal'));
const Auth = loadable(() => import('pages/auth'));
const SignOut = loadable(() => import('pages/sign-out'));
const Profile = loadable(() => import('pages/profile'));
const Settings = loadable(() => import('pages/settings'));
const Exception = loadable(() => import('pages/exception'));

import 'styles/style.less';

class Routes extends React.Component<any> {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/create" component={Create} />
        <Route exact path="/proposals" component={Proposals} />
        <Route path="/proposals/:id" component={Proposal} />
        <AuthRoute exact path="/profile" component={Profile} />
        <AuthRoute exact path="/profile/settings" component={Settings} />
        <Route path="/profile/:id" component={Profile} />
        <AuthRoute exact path="/auth" component={Auth} onlyLoggedOut />
        <Route exact path="/auth/sign-out" component={SignOut} />
        <Route path="/*" render={() => <Exception type="404" />} />
      </Switch>
    );
  }
}

export default hot(module)(Routes);
