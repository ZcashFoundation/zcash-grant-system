import React from 'react';
import { view } from 'react-easy-state';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import './index.less';

class Settings extends React.Component {
  state = {
    username: '',
    password: '',
  };

  render() {
    return (
      <div className="Settings">
        <div>
          <h1>Two-Factor Authentication</h1>
          <p>
            This will require saving new recovery codes and setting up an Authenticator
            application.{' '}
            <b>Current recovery and Authenticator codes will be invalidated.</b>
          </p>
          <Link to="/settings/2fa-reset">
            <Button>Setup 2FA</Button>
          </Link>
        </div>
      </div>
    );
  }
}

export default view(Settings);
