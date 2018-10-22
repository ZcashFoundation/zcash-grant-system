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
import PlaceHolder from 'components/Placeholder';
import Exception from 'pages/exception';
import './style.less';

interface StateProps {
  usersMap: UsersState['map'];
  authUser: AppState['auth']['user'];
}

interface DispatchProps {
  fetchUser: typeof usersActions['fetchUser'];
  fetchUserCreated: typeof usersActions['fetchUserCreated'];
  fetchUserFunded: typeof usersActions['fetchUserFunded'];
  fetchUserComments: typeof usersActions['fetchUserComments'];
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
      if (authUser && authUser.ethAddress) {
        return <Redirect to={`/profile/${authUser.ethAddress}`} />;
      } else {
        return <Redirect to="auth" />;
      }
    }

    const user = this.props.usersMap[userLookupParam];
    const waiting = !user || !user.hasFetched;

    if (waiting) {
      return <Spin />;
    }

    if (user.fetchError) {
      return <Exception code="404" />;
    }

    const { createdProposals, fundedProposals, comments } = user;
    const noneCreated = user.hasFetchedCreated && createdProposals.length === 0;
    const noneFunded = user.hasFetchedFunded && fundedProposals.length === 0;
    const noneCommented = user.hasFetchedComments && comments.length === 0;

    return (
      <div className="Profile">
        {/* TODO: SSR fetch user details */}
        {/* TODO: customize details for funders/creators */}
        <HeaderDetails
          title={`${user.name} is funding projects on Grant.io`}
          description={`Join ${user.name} in funding the future!`}
          image={user.avatarUrl}
        />
        <ProfileUser user={user} />
        <Tabs>
          <Tabs.TabPane
            tab={TabTitle('Created', createdProposals.length)}
            key="created"
            disabled={!user.hasFetchedCreated}
          >
            <div>
              {noneCreated && (
                <PlaceHolder subtitle="Has not created any proposals yet" />
              )}
              {createdProposals.map(p => (
                <ProfileProposal key={p.proposalId} proposal={p} />
              ))}
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={TabTitle('Funded', fundedProposals.length)}
            key="funded"
            disabled={!user.hasFetchedFunded}
          >
            <div>
              {noneFunded && <PlaceHolder subtitle="Has not funded any proposals yet" />}
              {createdProposals.map(p => (
                <ProfileProposal key={p.proposalId} proposal={p} />
              ))}
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={TabTitle('Comments', comments.length)}
            key="comments"
            disabled={!user.hasFetchedComments}
          >
            <div>
              {noneCommented && <PlaceHolder subtitle="Has not made any comments yet" />}
              {comments.map(c => (
                <ProfileComment key={c.commentId} userName={user.name} comment={c} />
              ))}
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
  private fetchData() {
    const userLookupId = this.props.match.params.id;
    if (userLookupId) {
      this.props.fetchUser(userLookupId);
      this.props.fetchUserCreated(userLookupId);
      this.props.fetchUserFunded(userLookupId);
      this.props.fetchUserComments(userLookupId);
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
    fetchUserCreated: usersActions.fetchUserCreated,
    fetchUserFunded: usersActions.fetchUserFunded,
    fetchUserComments: usersActions.fetchUserComments,
  },
);

export default compose<Props, {}>(
  withRouter,
  withConnect,
)(Profile);
