import React from 'react';
import { hot } from 'react-hot-loader';
import { Switch, Route, Redirect } from 'react-router';
import { injectGlobal } from 'styled-components';
import loadable from 'loadable-components';

// wrap components in loadable...import & they will be split
const Home = loadable(() => import('pages/index'));
const Create = loadable(() => import('pages/create'));
const Proposals = loadable(() => import('pages/proposals'));
const Proposal = loadable(() => import('pages/proposal'));

import 'styles/style.less';

// tslint:disable-next-line:no-unused-expression
injectGlobal`
  * {
    margin: 0;
	  padding: 0;
	  border: 0;
	  font-size: 100%;
  }
  html {
    font-size: 16px;

    @media (max-width: 900px) {
      font-size: 14px;
    }
    @media (max-width: 600px) {
      font-size: 12px;
    }

  }
`;

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
