import React from 'react';
import { view } from 'react-easy-state';
import { Input, Button, Alert } from 'antd';
import store from '../../store';
import './index.less';

class Login extends React.Component {
  state = {
    username: '',
    password: '',
  };

  render() {
    return (
      <div className="Login">
        {store.isLoggedIn && !store.is2faAuthed && <h1>Requires 2FA setup or verify.</h1>}
        {!store.isLoggedIn && (
          <>
            <h1>Login</h1>
            <div>
              <Input
                name="username"
                placeholder="Username"
                value={this.state.username}
                onChange={e => this.setState({ username: e.currentTarget.value })}
              />
            </div>
            <div>
              <Input
                name="password"
                type="password"
                placeholder="Password"
                value={this.state.password}
                onChange={e => this.setState({ password: e.currentTarget.value })}
              />
            </div>
            {store.loginError && (
              <div>
                <Alert message={store.loginError} type="warning" />
              </div>
            )}
            <div>
              <Button
                type="primary"
                onClick={() => store.login(this.state.username, this.state.password)}
              >
                Login
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }
}

export default view(Login);
