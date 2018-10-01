import React from 'react';
import { connect } from 'react-redux';
import { Form, Input, Button } from 'antd';
import Identicon from 'components/Identicon';
import ShortAddress from 'components/ShortAddress';
import { AUTH_PROVIDER } from 'utils/auth';
import { authActions } from 'modules/auth';
import { AppState } from 'store/reducers';
import './SignUp.less';

interface StateProps {
  isCreatingUser: AppState['auth']['isCreatingUser'];
  createUserError: AppState['auth']['createUserError'];
}

interface DispatchProps {
  createUser: typeof authActions['createUser'];
}

interface OwnProps {
  address: string;
  provider: AUTH_PROVIDER;
  reset(): void;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  name: string;
  email: string;
}

class SignUp extends React.PureComponent<Props, State> {
  state: State = {
    name: '',
    email: '',
  };

  render() {
    const { address, isCreatingUser } = this.props;
    const { name, email } = this.state;

    return (
      <div className="SignUp">
        <div className="SignUp-container">
          <div className="SignUp-identity">
            <Identicon address={address} className="SignUp-identity-identicon" />
            <ShortAddress address={address} className="SignUp-identity-address" />
          </div>

          <Form className="SignUp-form" onSubmit={this.handleSubmit} layout="vertical">
            <Form.Item className="SignUp-form-item" label="Display name">
              <Input
                name="name"
                value={name}
                onChange={this.handleChange}
                placeholder="Non-unique name that others will see you as"
                size="large"
              />
            </Form.Item>

            <Form.Item className="SignUp-form-item" label="Email address">
              <Input
                name="email"
                value={email}
                onChange={this.handleChange}
                placeholder="We promise not to spam you or share your email"
                size="large"
              />
            </Form.Item>

            {}
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={isCreatingUser}
            >
              Claim Identity
            </Button>
          </Form>
        </div>

        <p className="SignUp-back">
          Want to use a different identity? <a onClick={this.props.reset}>Click here</a>.
        </p>
      </div>
    );
  }

  private handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = ev.currentTarget;
    this.setState({ [name]: value } as any);
  };

  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    const { address, createUser } = this.props;
    const { name, email } = this.state;
    ev.preventDefault();
    createUser(address, name, email);
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    isCreatingUser: state.auth.isCreatingUser,
    createUserError: state.auth.createUserError,
  }),
  {
    createUser: authActions.createUser,
  },
)(SignUp);
