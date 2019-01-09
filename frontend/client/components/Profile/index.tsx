import React from 'react';
import {
  withRouter,
  RouteComponentProps,
  Redirect,
  Switch,
  Route,
} from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Spin, Tabs, Badge } from 'antd';
import { usersActions } from 'modules/users';
import { AppState } from 'store/reducers';
import HeaderDetails from 'components/HeaderDetails';
import ProfileUser from './ProfileUser';
import ProfileEdit from './ProfileEdit';
import ProfilePendingList from './ProfilePendingList';
import ProfileProposal from './ProfileProposal';
import ProfileContribution from './ProfileContribution';
import ProfileComment from './ProfileComment';
import ProfileInvite from './ProfileInvite';
import Placeholder from 'components/Placeholder';
import Exception from 'pages/exception';
import ContributionModal from 'components/ContributionModal';
import './style.less';
import { UserContribution } from 'types';

interface StateProps {
  usersMap: AppState['users']['map'];
  authUser: AppState['auth']['user'];
}

interface DispatchProps {
  fetchUser: typeof usersActions['fetchUser'];
  fetchUserInvites: typeof usersActions['fetchUserInvites'];
}

type Props = RouteComponentProps<any> & StateProps & DispatchProps;

interface State {
  activeContribution: UserContribution | null;
}

class Profile extends React.Component<Props, State> {
  state: State = {
    activeContribution: null,
  };

  componentDidMount() {
    this.fetchData();
  }
  componentDidUpdate(prevProps: Props) {
    const userLookupId = this.props.match.params.id;
    const prevUserLookupId = prevProps.match.params.id;
    if (userLookupId !== prevUserLookupId) {
      window.scrollTo(0, 0);
      this.fetchData();
    }
  }
  render() {
    const userLookupParam = this.props.match.params.id;
    const { authUser, match } = this.props;
    const { activeContribution } = this.state;

    if (!userLookupParam) {
      if (authUser && authUser.userid) {
        return <Redirect to={`/profile/${authUser.userid}`} />;
      } else {
        return <Redirect to="auth" />;
      }
    }

    const user = this.props.usersMap[userLookupParam];
    const waiting = !user || !user.hasFetched;
    const isAuthedUser = user && authUser && user.userid === authUser.userid;

    if (waiting) {
      return <Spin />;
    }

    if (user.fetchError) {
      return <Exception code="404" />;
    }

    const { proposals, pendingProposals, contributions, comments, invites } = user;
    const nonePending = pendingProposals.length === 0;
    const noneCreated = proposals.length === 0;
    const noneFunded = contributions.length === 0;
    const noneCommented = comments.length === 0;
    const noneInvites = user.hasFetchedInvites && invites.length === 0;

    return (
      <div className="Profile">
        {/* TODO: customize details for funders/creators */}
        <HeaderDetails
          title={`${user.displayName} is funding projects on Grant.io`}
          description={`Join ${user.displayName} in funding the future!`}
          image={user.avatar ? user.avatar.imageUrl : undefined}
        />
        <Switch>
          <Route
            path={`${match.path}`}
            exact={true}
            render={() => <ProfileUser user={user} />}
          />
          <Route
            path={`${match.path}/edit`}
            exact={true}
            render={() => <ProfileEdit user={user} />}
          />
        </Switch>
        <Tabs>
          {isAuthedUser && (
            <Tabs.TabPane
              tab={TabTitle('Pending', pendingProposals.length)}
              key="pending"
            >
              <div>
                {nonePending && (
                  <Placeholder
                    title="No pending proposals"
                    subtitle="You do not have any proposals awaiting approval."
                  />
                )}
                <ProfilePendingList proposals={pendingProposals} />
              </div>
            </Tabs.TabPane>
          )}
          <Tabs.TabPane tab={TabTitle('Created', proposals.length)} key="created">
            <div>
              {noneCreated && (
                <Placeholder subtitle="Has not created any proposals yet" />
              )}
              {proposals.map(p => (
                <ProfileProposal key={p.proposalId} proposal={p} />
              ))}
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab={TabTitle('Funded', contributions.length)} key="funded">
            <div>
              {noneFunded && <Placeholder subtitle="Has not funded any proposals yet" />}
              {contributions.map(c => (
                <ProfileContribution
                  key={c.id}
                  userId={user.userid}
                  contribution={c}
                  showSendInstructions={this.openContributionModal}
                />
              ))}
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab={TabTitle('Comments', comments.length)} key="comments">
            <div>
              {noneCommented && <Placeholder subtitle="Has not made any comments yet" />}
              {comments.map(c => (
                <ProfileComment key={c.id} userName={user.displayName} comment={c} />
              ))}
            </div>
          </Tabs.TabPane>
          {isAuthedUser && (
            <Tabs.TabPane
              tab={TabTitle('Invites', invites.length)}
              key="invites"
              disabled={!user.hasFetchedInvites}
            >
              <div>
                {noneInvites && (
                  <Placeholder
                    title="No invites here!"
                    subtitle="You’ll be notified when you’ve been invited to join a proposal"
                  />
                )}
                {invites.map(invite => (
                  <ProfileInvite key={invite.id} userId={user.userid} invite={invite} />
                ))}
              </div>
            </Tabs.TabPane>
          )}
        </Tabs>

        <ContributionModal
          isVisible={!!activeContribution}
          proposalId={
            activeContribution ? activeContribution.proposal.proposalId : undefined
          }
          contributionId={activeContribution ? activeContribution.id : undefined}
          hasNoButtons
          handleClose={this.closeContributionModal}
        />
      </div>
    );
  }

  private fetchData() {
    const { match } = this.props;
    const userLookupId = match.params.id;
    if (userLookupId) {
      this.props.fetchUser(userLookupId);
      this.props.fetchUserInvites(userLookupId);
    }
  }

  private openContributionModal = (c: UserContribution) => this.setState({ activeContribution: c });
  private closeContributionModal = () => this.setState({ activeContribution: null });
}

const TabTitle = (disp: string, count: number) => (
  <div>
    {disp}
    <Badge
      className={`Profile-tabBadge ${count > 0 ? 'is-not-zero' : 'is-zero'}`}
      showZero={true}
      count={count}
    />
  </div>
);

const withConnect = connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    usersMap: state.users.map,
    authUser: state.auth.user,
  }),
  {
    fetchUser: usersActions.fetchUser,
    fetchUserInvites: usersActions.fetchUserInvites,
  },
);

export default compose<Props, {}>(
  withRouter,
  withConnect,
)(Profile);
