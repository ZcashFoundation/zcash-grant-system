import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import Result from 'ant-design-pro/lib/Result';
import { authActions } from 'modules/auth';
import AntWrap from 'components/AntWrap';

interface Props {
  logout: typeof authActions['logout'];
}

class SignInPage extends React.Component<Props> {
  componentDidMount() {
    this.props.logout();
  }

  render() {
    return (
      <AntWrap title="Signed out">
        <Result
          type="success"
          title="You are now signed out"
          actions={
            <>
              <Link to="/auth" style={{ marginRight: '0.5rem' }}>
                <Button type="primary" size="large">
                  Change account
                </Button>
              </Link>
              <Link to="/">
                <Button type="default" size="large">
                  Return Home
                </Button>
              </Link>
            </>
          }
        />
      </AntWrap>
    );
  }
}

export default connect(
  undefined,
  { logout: authActions.logout },
)(SignInPage);
