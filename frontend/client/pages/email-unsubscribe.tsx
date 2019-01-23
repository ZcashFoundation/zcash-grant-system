import React from 'react';
import { Spin, Button } from 'antd';
import qs from 'query-string';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import Result from 'ant-design-pro/lib/Result';
import { unsubscribeEmail } from 'api/api';

interface State {
  isUnsubscribing: boolean;
  hasUnsubscribed: boolean;
  error: string | null;
}

class UnsubscribeEmail extends React.Component<RouteComponentProps, State> {
  state: State = {
    isUnsubscribing: false,
    hasUnsubscribed: false,
    error: null,
  };

  componentDidMount() {
    const args = qs.parse(this.props.location.search);
    if (args.code) {
      this.setState({ isUnsubscribing: true });
      unsubscribeEmail(args.code)
        .then(() => {
          this.setState({
            hasUnsubscribed: true,
            isUnsubscribing: false,
          });
        })
        .catch(err => {
          this.setState({
            error: err.message || err.toString(),
            isUnsubscribing: false,
          });
        });
    } else {
      this.setState({
        error: `
          Missing code parameter from email.
          Make sure you copied the full link.
        `,
      });
    }
  }

  render() {
    const { hasUnsubscribed, error } = this.state;

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

    if (hasUnsubscribed) {
      return (
        <Result
          type="success"
          title="Unsubscribed from emails"
          description="You will no longer receive emails from ZF Grants"
          actions={actions}
        />
      );
    } else if (error) {
      return (
        <Result
          type="error"
          title="Unable to unsubscribe from emails"
          description={error}
          actions={actions}
        />
      );
    } else {
      return <Spin size="large" />;
    }
  }
}

export default withRouter(UnsubscribeEmail);
