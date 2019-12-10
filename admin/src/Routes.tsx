import React from 'react';
import { view } from 'react-easy-state';
import { hot } from 'react-hot-loader';
import { Switch, Route, RouteComponentProps, withRouter } from 'react-router';

import Template from 'components/Template';
import store from './store';
import Login from 'components/Login';
import MFAuth from 'components/MFAuth';
import Home from 'components/Home';
import Users from 'components/Users';
import UserDetail from 'components/UserDetail';
import Emails from 'components/Emails';
import Proposals from 'components/Proposals';
import ProposalDetail from 'components/ProposalDetail';
import CCRs from 'components/CCRs';
import CCRDetail from 'components/CCRDetail';
import RFPs from 'components/RFPs';
import RFPForm from 'components/RFPForm';
import RFPDetail from 'components/RFPDetail';
import Contributions from 'components/Contributions';
import ContributionForm from 'components/ContributionForm';
import ContributionDetail from 'components/ContributionDetail';
import Financials from 'components/Financials';
import Moderation from 'components/Moderation';
import Settings from 'components/Settings';

import 'styles/style.less';

type Props = RouteComponentProps<any>;

class Routes extends React.Component<Props> {
  render() {
    const { hasCheckedLogin, isLoggedIn, is2faAuthed } = store;
    if (!hasCheckedLogin) {
      return <div>checking auth status...</div>;
    }

    return (
      <Template>
        {!isLoggedIn ? (
          <Login />
        ) : !is2faAuthed ? (
          <MFAuth />
        ) : (
          <Switch>
            <Route path="/" exact={true} component={Home} />
            <Route path="/users/:id" component={UserDetail} />
            <Route path="/users" component={Users} />
            <Route path="/proposals/:id" component={ProposalDetail} />
            <Route path="/proposals" component={Proposals} />
            <Route path="/ccrs/:id" component={CCRDetail} />
            <Route path="/ccrs" component={CCRs} />
            <Route path="/rfps/new" component={RFPForm} />
            <Route path="/rfps/:id/edit" component={RFPForm} />
            <Route path="/rfps/:id" component={RFPDetail} />
            <Route path="/rfps" component={RFPs} />
            <Route path="/contributions/new" component={ContributionForm} />
            <Route path="/contributions/:id/edit" component={ContributionForm} />
            <Route path="/contributions/:id" component={ContributionDetail} />
            <Route path="/contributions" component={Contributions} />
            <Route path="/financials" component={Financials} />
            <Route path="/emails/:type?" component={Emails} />
            <Route path="/moderation" component={Moderation} />
            <Route path="/settings/2fa-reset" render={() => <MFAuth isReset={true} />} />
            <Route path="/settings" component={Settings} />
          </Switch>
        )}
      </Template>
    );
  }
}

const ConnectedRoutes = withRouter(view(Routes));
export default hot(module)(ConnectedRoutes);
