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
import { Tabs, Badge } from 'antd';
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
import ProfileCCR from './ProfileCCR';
import Placeholder from 'components/Placeholder';
import Loader from 'components/Loader';
import ExceptionPage from 'components/ExceptionPage';
import ContributionModal from 'components/ContributionModal';
import LinkableTabs from 'components/LinkableTabs';
import { UserContribution } from 'types';
import ProfileArbitrated from './ProfileArbitrated';
import './style.less';

interface StateProps {
  usersMap: AppState['users']['map'];
  authUser: AppState['auth']['user'];
  hasCheckedUser: AppState['auth']['hasCheckedUser'];
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
    const { authUser, match, location, hasCheckedUser } = this.props;
    const { activeContribution } = this.state;
    const userLookupParam = match.params.id;

    if (!userLookupParam) {
      if (authUser && authUser.userid) {
        return <Redirect to={{ ...location, pathname: `/profile/${authUser.userid}` }} />;
      } else {
        return <Redirect to={{ ...location, pathname: '/auth' }} />;
      }
    }

    const user = this.props.usersMap[userLookupParam];
    const waiting = !user || !user.hasFetched || !hasCheckedUser;
    const isAuthedUser = user && authUser && user.userid === authUser.userid;

    if (waiting) {
      return <Loader size="large" />;
    }

    if (user.fetchError) {
      return <ExceptionPage code="404" desc="No user could be found" />;
    }

    const {
      proposals,
      pendingProposals,
      pendingRequests,
      requests,
      contributions,
      comments,
      invites,
      arbitrated,
    } = user;

    const isLoading = user.isFetching;
    const noProposalsPending = pendingProposals.length === 0;
    const noProposalsCreated = proposals.length === 0;
    const noRequestsPending = pendingRequests.length === 0;
    const noRequestsCreated = requests.length === 0;
    const noneFunded = contributions.length === 0;
    const noneCommented = comments.length === 0;
    const noneArbitrated = arbitrated.length === 0;
    const noneInvites = user.hasFetchedInvites && invites.length === 0;

    return (
      <div className="Profile">
        <HeaderDetails
          title={`${user.displayName} on ZF Grants`}
          description={`Join ${user.displayName} in improving the Zcash ecosystem!`}
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
        <div className="Profile-tabs">
          <LinkableTabs defaultActiveKey={(isAuthedUser && 'pending') || 'created'}>
            {isAuthedUser && (
              <Tabs.TabPane
                tab={TabTitle(
                  'Pending',
                  pendingProposals.length + pendingRequests.length,
                )}
                key="pending"
              >
                <div>
                  {noProposalsPending &&
                    noRequestsPending && (
                      <Placeholder
                        loading={isLoading}
                        title="No pending items"
                        subtitle="You do not have any proposals or requests awaiting approval."
                      />
                    )}
                  <ProfilePendingList
                    proposals={pendingProposals}
                    requests={pendingRequests}
                  />
                </div>
              </Tabs.TabPane>
            )}
            <Tabs.TabPane
              tab={TabTitle('Created', proposals.length + requests.length)}
              key="created"
            >
              <div>
                {noProposalsCreated &&
                  noRequestsCreated && (
                    <Placeholder
                      loading={isLoading}
                      title="No created items"
                      subtitle="There have not been any created proposals or requests."
                    />
                  )}
                {proposals.map(p => (
                  <ProfileProposal key={p.proposalId} proposal={p} />
                ))}
                {requests.map(c => (
                  <ProfileCCR key={c.ccrId} ccr={c} />
                ))}
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab={TabTitle('Funded', contributions.length)} key="funded">
              <div>
                {noneFunded && (
                  <Placeholder
                    loading={isLoading}
                    title="No proposals funded"
                    subtitle="There have not been any proposals funded."
                  />
                )}
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
                {noneCommented && (
                  <Placeholder
                    loading={isLoading}
                    title="No comments"
                    subtitle="There have not been any comments made"
                  />
                )}
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
                      loading={isLoading}
                      title="No invitations"
                      subtitle="You’ll be notified when you’ve been invited to join a proposal"
                    />
                  )}
                  {invites.map(invite => (
                    <ProfileInvite key={invite.id} userId={user.userid} invite={invite} />
                  ))}
                </div>
              </Tabs.TabPane>
            )}
            {isAuthedUser && (
              <Tabs.TabPane
                tab={TabTitle('Arbitrations', arbitrated.length)}
                key="arbitrations"
              >
                {noneArbitrated && (
                  <Placeholder
                    loading={isLoading}
                    title="No arbitrations"
                    subtitle="You are not an arbiter of any proposals"
                  />
                )}
                {arbitrated.map(arb => (
                  <ProfileArbitrated key={arb.proposal.proposalId} arbiter={arb} />
                ))}
              </Tabs.TabPane>
            )}
          </LinkableTabs>
        </div>

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

  private openContributionModal = (c: UserContribution) =>
    this.setState({ activeContribution: c });
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
    hasCheckedUser: state.auth.hasCheckedUser,
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
