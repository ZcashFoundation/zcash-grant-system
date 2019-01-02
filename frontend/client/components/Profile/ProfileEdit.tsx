import React from 'react';
import lodash from 'lodash';
import qs from 'query-string';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import axios from 'api/axios';
import { getSocialAuthUrl, verifySocial } from 'api/api';
import { usersActions } from 'modules/users';
import { AppState } from 'store/reducers';
import { Input, Form, Col, Row, Button, Alert, Icon } from 'antd';
import { SOCIAL_INFO } from 'utils/social';
import { SOCIAL_SERVICE, User } from 'types';
import { UserState } from 'modules/users/reducers';
import { getCreateTeamMemberError } from 'modules/create/utils';
import AvatarEdit from './AvatarEdit';
import './ProfileEdit.less';

interface OwnProps {
  user: UserState;
}

interface StateProps {
  authUser: AppState['auth']['user'];
  hasCheckedAuthUser: AppState['auth']['hasCheckedUser'];
}

interface DispatchProps {
  fetchUser: typeof usersActions['fetchUser'];
  updateUser: typeof usersActions['updateUser'];
}

type Props = OwnProps & StateProps & DispatchProps & RouteComponentProps;

interface State {
  fields: User;
  isChanged: boolean;
  showError: boolean;
  isDone: boolean;
  socialVerificationMessage: string;
  socialVerificationError: string;
  activeSocialService: SOCIAL_SERVICE | null;
}

class ProfileEdit extends React.PureComponent<Props, State> {
  state: State = {
    fields: { ...this.props.user } as User,
    isChanged: false,
    showError: false,
    isDone: false,
    socialVerificationError: '',
    socialVerificationMessage: '',
    activeSocialService: null,
  };

  componentDidMount() {
    this.verifySocial();
  }

  componentDidUpdate(prevProps: Props, _: State) {
    if (
      prevProps.user.isUpdating &&
      !this.props.user.isUpdating &&
      !this.state.showError
    ) {
      this.setState({ showError: true });
    }
    if (
      prevProps.user.isUpdating &&
      !this.props.user.isUpdating &&
      !this.props.user.updateError
    ) {
      this.handleDone();
    }
  }

  render() {
    const { fields } = this.state;
    const {
      user,
      user: { userid },
    } = this.props;
    const {
      socialVerificationMessage,
      socialVerificationError,
      activeSocialService,
    } = this.state;
    const error = getCreateTeamMemberError(fields);
    const isMissingField = !fields.displayName || !fields.title || !fields.emailAddress;
    const isDisabled =
      !!error ||
      isMissingField ||
      !this.state.isChanged ||
      !!this.state.activeSocialService;

    if (this.state.isDone) {
      return <Redirect to={`/profile/${userid}`} />;
    }

    return (
      <>
        <div className="ProfileEdit">
          <AvatarEdit
            user={fields}
            onDone={this.handleChangePhoto}
            onDelete={this.handleDeletePhoto}
          />

          <div className="ProfileEdit-info">
            <Form
              className="ProfileEdit-info-form"
              layout="vertical"
              onSubmit={this.handleSave}
            >
              <Form.Item>
                <Input
                  name="displayName"
                  autoComplete="off"
                  placeholder="Display name (Required)"
                  value={fields.displayName}
                  onChange={this.handleChangeField}
                />
              </Form.Item>

              <Form.Item>
                <Input
                  name="title"
                  autoComplete="off"
                  placeholder="Title (Required)"
                  value={fields.title}
                  onChange={this.handleChangeField}
                />
              </Form.Item>

              <Form.Item>
                <Input
                  name="emailAddress"
                  disabled={true}
                  placeholder="Email address (Required)"
                  type="email"
                  autoComplete="email"
                  value={fields.emailAddress}
                  onChange={this.handleChangeField}
                />
              </Form.Item>

              <Row gutter={12}>
                {Object.values(SOCIAL_INFO).map(s => {
                  const field = fields.socialMedias.find(sm => sm.service === s.service);
                  const loading = s.service === activeSocialService;
                  return (
                    <Col xs={24} md={8} key={s.service}>
                      <Form.Item>
                        {field &&
                          field.username && (
                            <Button
                              className="ProfileEdit-socialButton is-delete"
                              type="primary"
                              ghost
                              onClick={() => this.handleSocialDelete(s.service)}
                              loading={loading}
                              block
                            >
                              <div className="ProfileEdit-socialButton-text">
                                {!loading && s.icon} <strong>{field.username}</strong>
                              </div>
                              <div className="ProfileEdit-socialButton-delete">
                                <Icon type="delete" /> Unlink account
                              </div>
                            </Button>
                          )}
                        {!field && (
                          <Button
                            className="ProfileEdit-socialButton is-add"
                            onClick={() => this.handleSocialAdd(s.service)}
                            loading={loading}
                            block
                          >
                            {!loading && s.icon}
                            Connect to {s.name}
                          </Button>
                        )}
                      </Form.Item>
                    </Col>
                  );
                })}
              </Row>
              {socialVerificationError && (
                <Alert type="error" message={socialVerificationError} closable />
              )}
              {socialVerificationMessage && (
                <Alert type="success" message={socialVerificationMessage} closable />
              )}

              {!isMissingField &&
                error && <Alert type="error" message={error} showIcon />}

              <Row>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={isDisabled}
                  loading={user.isUpdating}
                >
                  Save changes
                </Button>
                <Button type="ghost" htmlType="button" onClick={this.handleCancel}>
                  Cancel
                </Button>
              </Row>
            </Form>
            {this.state.showError &&
              user.updateError && (
                <Alert
                  className="ProfileEdit-alert"
                  message={`There was an error attempting to update your profile. (code ${
                    user.updateError
                  })`}
                  type="error"
                />
              )}
          </div>
        </div>
        <div className="ProfileEditShade" />
      </>
    );
  }

  private verifySocial = () => {
    const args = qs.parse(this.props.location.search);
    const { userid } = this.props.user;
    if (args.code && args.service) {
      this.setState({ activeSocialService: args.service });
      verifySocial(args.service, args.code)
        .then(async res => {
          // refresh user data
          await this.props.fetchUser(userid.toString());
          // update just the socialMedias on state.fields
          const socialMedias = this.props.user.socialMedias;
          const fields = {
            ...this.state.fields,
            socialMedias,
          };
          this.setState({
            fields,
            activeSocialService: null,
            socialVerificationMessage: `
            Verified ${res.data.username} on ${args.service.toLowerCase()}.
            `,
          });
          // remove search query from url
          this.props.history.push({ pathname: `/profile/${userid}/edit` });
        })
        .catch(e => {
          this.setState({
            activeSocialService: null,
            socialVerificationError: e.message || e.toString(),
          });
        });
    }
  };

  private handleSave = (evt: React.SyntheticEvent<any>) => {
    evt.preventDefault();
    this.props.updateUser(this.state.fields);
  };

  private handleCancel = () => {
    const propsAvatar = this.props.user.avatar;
    const stateAvatar = this.state.fields.avatar;
    // cleanup uploaded file if we cancel
    if (
      stateAvatar &&
      stateAvatar.imageUrl &&
      (!propsAvatar || propsAvatar.imageUrl !== stateAvatar.imageUrl)
    ) {
      axios.delete('/api/v1/users/avatar', {
        params: { url: stateAvatar.imageUrl },
      });
    }
    this.handleDone();
  };

  private handleChangeField = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = ev.currentTarget;
    const fields = {
      ...this.state.fields,
      [name as any]: value,
    };
    const isChanged = this.isChangedCheck(fields);
    this.setState({
      isChanged,
      fields,
    });
  };

  private handleSocialAdd = async (service: SOCIAL_SERVICE) => {
    this.setState({ activeSocialService: service });
    if (this.state.isChanged) {
      // save any changes first
      await this.props.updateUser(this.state.fields);
    }
    getSocialAuthUrl(service)
      .then(res => {
        window.location.href = res.data.url;
      })
      .catch(e => {
        this.setState({
          activeSocialService: null,
          socialVerificationError: e.message || e.toString(),
        });
      });
  };

  private handleSocialDelete = (service: SOCIAL_SERVICE) => {
    const socialMedias = this.state.fields.socialMedias.filter(
      sm => sm.service !== service,
    );
    const fields = {
      ...this.state.fields,
      socialMedias,
    };
    this.setState({
      fields,
      isChanged: this.isChangedCheck(fields),
    });
  };

  private handleChangePhoto = (url: string) => {
    const fields = {
      ...this.state.fields,
      avatar: {
        imageUrl: url,
      },
    };
    const isChanged = this.isChangedCheck(fields);
    this.setState({
      isChanged,
      fields,
    });
  };

  private handleDeletePhoto = () => {
    const fields = {
      ...this.state.fields,
      avatar: null,
    };
    const isChanged = this.isChangedCheck(fields);
    this.setState({ isChanged, fields });
  };

  private isChangedCheck = (a: User) => {
    return !lodash.isEqual(a, this.props.user);
  };

  private handleDone = () => {
    this.setState({ isDone: true });
  };
}

const withConnect = connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    authUser: state.auth.user,
    hasCheckedAuthUser: state.auth.hasCheckedUser,
  }),
  {
    fetchUser: usersActions.fetchUser,
    updateUser: usersActions.updateUser,
  },
);

export default compose<Props, OwnProps>(
  withRouter,
  withConnect,
)(ProfileEdit);
