import React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';

interface Props {
  user: AppState['auth']['user'];
}

class ProfilePage extends React.Component<Props> {
  render() {
    const { user } = this.props;
    return <h1>Settings for {user && user.displayName}</h1>;
  }
}

export default connect((state: AppState) => ({ user: state.auth.user }))(ProfilePage);
