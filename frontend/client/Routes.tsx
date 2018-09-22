import React from 'react';
import { hot } from 'react-hot-loader';
import { Switch, Route, Redirect } from 'react-router';
import loadable from 'loadable-components';

// wrap components in loadable...import & they will be split
const Home = loadable(() => import('pages/index'));
const Create = loadable(() => import('pages/create'));
const Proposals = loadable(() => import('pages/proposals'));
const Proposal = loadable(() => import('pages/proposal'));

import 'styles/style.less';

class Routes extends React.Component<any> {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/create" component={Create} />
        <Route exact path="/proposals" component={Proposals} />
        <Route path="/proposals/:id" component={Proposal} />
        <Route path="/*" render={() => <Redirect to="/" />} />
      </Switch>
    );
  }
}

export default hot(module)(Routes);
