import React from 'react';
import { AppState } from 'store/reducers';
import { authActions } from 'modules/auth';
import { getEmail } from 'modules/auth/selectors';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';
import { Button } from 'antd';

interface StateProps {
  email: string | null;
}

interface DispatchProps {
  logoutAndRedirect: authActions.TLogoutAndRedirect;
}

type Props = DispatchProps & StateProps;

class Profile extends React.Component<Props> {
  render() {
    return (
      <div>
        <Button type="primary" onClick={() => this.props.logoutAndRedirect()}>
          Logout
        </Button>

        <h1>hi profile. {this.props.email}</h1>
      </div>
    );
  }
}

function mapStateToProps(state: AppState) {
  return {
    email: getEmail(state),
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(authActions, dispatch);
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(Profile);
