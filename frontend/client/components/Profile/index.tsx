import React from 'react';
import { UsersState } from 'modules/users/reducers';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';
import { usersActions } from 'modules/users';
import { AppState } from 'store/reducers';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Spin, Tabs, Badge } from 'antd';
import HeaderDetails from 'components/HeaderDetails';
import ProfileUser from './ProfileUser';
import ProfileProposal from './ProfileProposal';
import ProfileComment from './ProfileComment';
import ProfileInvite from './ProfileInvite';
import Placeholder from 'components/Placeholder';
import Exception from 'pages/exception';
import './style.less';

interface StateProps {
  usersMap: UsersState['map'];
  authUser: AppState['auth']['user'];
}

interface DispatchProps {
  fetchUser: typeof usersActions['fetchUser'];
  fetchUserInvites: typeof usersActions['fetchUserInvites'];
}

type Props = RouteComponentProps<any> & StateProps & DispatchProps;

class Profile extends React.Component<Props> {
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
    const { authUser } = this.props;
    if (!userLookupParam) {
      if (authUser && authUser.accountAddress) {
        return <Redirect to={`/profile/${authUser.accountAddress}`} />;
      } else {
        return <Redirect to="auth" />;
      }
    }

    const user = this.props.usersMap[userLookupParam];
    const waiting = !user || !user.hasFetched;
    // TODO: Replace with userid checks
    const isAuthedUser =
      user && authUser && user.accountAddress === authUser.accountAddress;

    if (waiting) {
      return <Spin />;
    }

    if (user.fetchError) {
      return <Exception code="404" />;
    }

    const { createdProposals, fundedProposals, comments, invites } = user;
    const noneCreated = createdProposals.length === 0;
    const noneFunded = fundedProposals.length === 0;
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
        <ProfileUser user={user} />
        <Tabs>
          <Tabs.TabPane tab={TabTitle('Created', createdProposals.length)} key="created">
            <div>
              {noneCreated && (
                <Placeholder subtitle="Has not created any proposals yet" />
              )}
              {createdProposals.map(p => (
                <ProfileProposal key={p.proposalId} proposal={p} />
              ))}
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab={TabTitle('Funded', fundedProposals.length)} key="funded">
            <div>
              {noneFunded && <Placeholder subtitle="Has not funded any proposals yet" />}
              {fundedProposals.map(p => (
                <ProfileProposal key={p.proposalId} proposal={p} />
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
                  <ProfileInvite
                    key={invite.id}
                    userId={user.accountAddress}
                    invite={invite}
                  />
                ))}
              </div>
            </Tabs.TabPane>
          )}
        </Tabs>
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
