import React from 'react';
import { connect } from 'react-redux';
import AntWrap from 'components/AntWrap';
import { AppState } from 'store/reducers';

interface Props {
  user: AppState['auth']['user'];
}

class ProfilePage extends React.Component<Props> {
  render() {
    const { user } = this.props;
    return (
      <AntWrap title="Settings">
        <h1>Settings for {user && user.name}</h1>
      </AntWrap>
    );
  }
}

export default connect((state: AppState) => ({ user: state.auth.user }))(ProfilePage);
