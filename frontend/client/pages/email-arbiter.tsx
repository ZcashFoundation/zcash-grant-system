import React from 'react';
import { Button } from 'antd';
import qs from 'query-string';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import Result from 'ant-design-pro/lib/Result';
import { arbiterEmail } from 'api/api';
import Loader from 'components/Loader';

interface State {
  isAccepting: boolean;
  hasAccepted: boolean;
  error: string | null;
}

class ArbiterEmail extends React.Component<RouteComponentProps, State> {
  state: State = {
    isAccepting: false,
    hasAccepted: false,
    error: null,
  };

  componentDidMount() {
    const args = qs.parse(this.props.location.search);
    if (args.code && args.proposalId) {
      this.setState({ isAccepting: true });
      arbiterEmail(args.code, parseInt(args.proposalId, 10))
        .then(() => {
          this.setState({
            hasAccepted: true,
            isAccepting: false,
          });
        })
        .catch(err => {
          this.setState({
            error: err.message || err.toString(),
            isAccepting: false,
          });
        });
    } else {
      this.setState({
        error: `
          Missing code or proposalId parameter from email.
          Make sure you copied the full link.
        `,
      });
    }
  }

  render() {
    const { hasAccepted, error } = this.state;
    const args = qs.parse(this.props.location.search);

    const actions = (
      <div>
        <Link to="/profile?tab=arbitrations">
          <Button size="large" type="primary">
            View arbitrations
          </Button>
        </Link>
        <Link to={`/proposals/${args.proposalId}`}>
          <Button size="large" style={{ marginLeft: '0.5rem' }}>
            Browse proposals
          </Button>
        </Link>
      </div>
    );

    if (hasAccepted) {
      return (
        <Result
          type="success"
          title="Arbiter nomination accepted"
          description="You are now responsible for approving payouts for the proposal"
          actions={actions}
        />
      );
    } else if (error) {
      return (
        <Result
          type="error"
          title="Unable to accept arbiter nomination"
          description={error}
          actions={actions}
        />
      );
    } else {
      return <Loader size="large" />;
    }
  }
}

export default withRouter(ArbiterEmail);
