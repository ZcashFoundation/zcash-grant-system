import React from 'react';
import { connect } from 'react-redux';
import AntWrap from 'components/AntWrap';
import Identicon from 'components/Identicon';
import { AppState } from 'store/reducers';

interface Props {
  user: AppState['auth']['user'];
}

class ProfilePage extends React.Component<Props> {
  render() {
    const { user } = this.props;
    return (
      <AntWrap title={user ? user.name : 'Profile'}>
        <h1>Hello, {user && user.name}</h1>
        <Identicon address={user.address} />
      </AntWrap>
    );
  }
}

export default connect((state: AppState) => ({ user: state.auth.user }))(ProfilePage);
