import React from 'react';
import { Spin, Button } from 'antd';
import qs from 'query-string';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import Result from 'ant-design-pro/lib/Result';
import { verifyEmail } from 'api/api';

interface State {
  isVerifying: boolean;
  hasVerified: boolean;
  error: string | null;
}

class VerifyEmail extends React.Component<RouteComponentProps, State> {
  state: State = {
    isVerifying: false,
    hasVerified: false,
    error: null,
  };

  componentDidMount() {
    const args = qs.parse(this.props.location.search);
    if (args.code) {
      this.setState({ isVerifying: true });
      verifyEmail(args.code)
        .then(() => {
          this.setState({
            hasVerified: true,
            isVerifying: false,
          })
        })
        .catch(err => {
          this.setState({
            error: err.message || err.toString(),
            isVerifying: false,
          });
        });
    } else {
      this.setState({
        error: `
          Missing code parameter from email.
          Make sure you copied the full link.
        `
      });
    }
  }

  render() {
    const { hasVerified, error } = this.state;

    const actions = (
      <div>
        <Link to="/profile">
          <Button size="large" type="primary">
            View profile
          </Button>
        </Link>
        <Link to="/proposals">
          <Button size="large" style={{ marginLeft: '0.5rem' }}>
            Browse proposals
          </Button>
        </Link>
      </div>
    );
    
    if (hasVerified) {
      return (
        <Result
          type="success"
          title="Email has been verified"
          description="You now have full access to Grant.io"
          actions={actions}
        />
      );
    } else if (error) {
      return (
        <Result
          type="error"
          title="Unable to verify email"
          description={error}
          actions={actions}
        />
      );
    } else {
      return <Spin size="large" />;
    }
  }
}

export default withRouter(VerifyEmail);