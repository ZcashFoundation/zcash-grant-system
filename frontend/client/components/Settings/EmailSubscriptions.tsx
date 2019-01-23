import React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import { updateUserSettings, getUserSettings } from 'api/api';
import { EmailSubscriptions as IEmailSubscriptions } from 'types';
import EmailSubscriptionsForm from 'components/EmailSubscriptionsForm';
import { message } from 'antd';
import Loader from 'components/Loader';

interface StateProps {
  authUser: AppState['auth']['user'];
}

type Props = StateProps;

const STATE = {
  emailSubscriptions: null as null | IEmailSubscriptions,
  loading: false,
};

type State = typeof STATE;

class EmailSubscriptions extends React.Component<Props, State> {
  state: State = { ...STATE };

  componentDidMount() {
    this.fetchSubscriptions();
  }

  render() {
    const { authUser } = this.props;
    const { emailSubscriptions, loading } = this.state;

    if (!authUser) {
      return 'This should not happen, no authorized user found.';
    }

    if (!emailSubscriptions) {
      return <Loader />;
    }

    return (
      <div className="EmailSubscriptions">
        <EmailSubscriptionsForm
          emailSubscriptions={emailSubscriptions}
          loading={loading}
          onSubmit={this.setSubscriptions}
        />
      </div>
    );
  }

  private fetchSubscriptions() {
    const { authUser } = this.props;
    if (!authUser) return;
    this.setState({ loading: true });
    getUserSettings(authUser.userid).then(res => {
      this.setState({ emailSubscriptions: res.data.emailSubscriptions, loading: false });
    });
  }

  private setSubscriptions = (emailSubscriptions: IEmailSubscriptions) => {
    const { authUser } = this.props;
    if (!authUser) return;
    this.setState({ loading: true });
    updateUserSettings(authUser.userid, emailSubscriptions)
      .then(res => {
        message.success('Settings saved.');
        this.setState({ emailSubscriptions: res.data.emailSubscriptions });
      })
      .catch(e => {
        message.error(e.message || e.toString(), 10);
      })
      .then(() => {
        this.setState({ loading: false });
      });
  };
}

const withConnect = connect<StateProps, {}, {}, AppState>(state => ({
  authUser: state.auth.user,
}));

export default withConnect(EmailSubscriptions);
