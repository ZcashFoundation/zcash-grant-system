import React from 'react';
import { Alert } from 'antd';
import qs from 'query-string';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { AppState } from 'store/reducers';
import { SOCIAL_INFO } from 'utils/social';
import Loader from 'components/Loader';

interface StateProps {
  authUser: AppState['auth']['user'];
  hasCheckedAuthUser: AppState['auth']['hasCheckedUser'];
}

type Props = StateProps & RouteComponentProps;

interface State {
  isVerifying: boolean;
  hasVerified: boolean;
  error: string | null;
  username: string;
}

class Callback extends React.Component<Props, State> {
  state: State = {
    isVerifying: false,
    hasVerified: false,
    error: null,
    username: '',
  };

  render() {
    const socialService = this.getSocialInfo();
    const args = qs.parse(this.props.location.search);
    const { hasCheckedAuthUser, authUser } = this.props;

    if (!hasCheckedAuthUser) {
      return <Loader />;
    }

    if (hasCheckedAuthUser && !authUser) {
      return <Alert message={`Must be logged in`} />;
    }

    if (!socialService) {
      return <Alert message={`Unsupported social service: ${this.getSocialUrlPart()}`} />;
    }

    // parse code
    let code = '';
    if (['GITHUB', 'LINKEDIN'].indexOf(socialService.service) > -1) {
      code = args.code;
    }
    if (socialService.service === 'TWITTER') {
      code = `${args.oauth_token}:${args.oauth_verifier}`;
    }

    if (!code) {
      return <Alert message={`Must have code parameter(s).`} />;
    }

    const userid = authUser && authUser.userid;
    const { service } = socialService;

    return <Redirect to={`/profile/${userid}/edit?service=${service}&code=${code}`} />;
  }

  private getSocialUrlPart = () => {
    return this.props.location.pathname.replace('/callback/', '');
  };

  private getSocialInfo = () => {
    const socialUrlPart = this.getSocialUrlPart();
    const socialService = Object.values(SOCIAL_INFO).find(
      si => si.service.toLowerCase() === socialUrlPart,
    );
    return socialService;
  };
}

const withConnect = connect<StateProps, {}, {}, AppState>(state => ({
  authUser: state.auth.user,
  hasCheckedAuthUser: state.auth.hasCheckedUser,
}));

export default compose<Props, {}>(
  withRouter,
  withConnect,
)(Callback);
