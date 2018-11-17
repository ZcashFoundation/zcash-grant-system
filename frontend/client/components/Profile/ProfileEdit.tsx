import React from 'react';
import lodash from 'lodash';
import axios from 'api/axios';
import { Input, Form, Col, Row, Button, Alert } from 'antd';
import { SOCIAL_INFO } from 'utils/social';
import { SOCIAL_TYPE, TeamMember } from 'types';
import { UserState } from 'modules/users/reducers';
import { getCreateTeamMemberError } from 'modules/create/utils';
import AvatarEdit from './AvatarEdit';
import './ProfileEdit.less';

interface Props {
  user: UserState;
  onDone(): void;
  onEdit(user: TeamMember): void;
}

interface State {
  fields: TeamMember;
  isChanged: boolean;
  showError: boolean;
}

export default class ProfileEdit extends React.PureComponent<Props, State> {
  state: State = {
    fields: { ...this.props.user } as TeamMember,
    isChanged: false,
    showError: false,
  };

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
      this.props.onDone();
    }
  }

  render() {
    const { fields } = this.state;
    const error = getCreateTeamMemberError(fields);
    const isMissingField =
      !fields.name || !fields.title || !fields.emailAddress || !fields.ethAddress;
    const isDisabled = !!error || isMissingField || !this.state.isChanged;

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
                  name="name"
                  autoComplete="off"
                  placeholder="Display name (Required)"
                  value={fields.name}
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

              <Form.Item>
                <Input
                  name="ethAddress"
                  disabled={true}
                  autoComplete="ethAddress"
                  placeholder="Ethereum address (Required)"
                  value={fields.ethAddress}
                  onChange={this.handleChangeField}
                />
              </Form.Item>

              <Row gutter={12}>
                {Object.values(SOCIAL_INFO).map(s => (
                  <Col xs={24} sm={12} key={s.type}>
                    <Form.Item>
                      <Input
                        placeholder={`${s.name} account`}
                        autoComplete="off"
                        value={fields.socialAccounts[s.type]}
                        onChange={ev => this.handleSocialChange(ev, s.type)}
                        addonBefore={s.icon}
                      />
                    </Form.Item>
                  </Col>
                ))}
              </Row>

              {!isMissingField &&
                error && (
                  <Alert
                    type="error"
                    message={error}
                    showIcon
                    style={{ marginBottom: '0.75rem' }}
                  />
                )}

              <Row>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={isDisabled}
                  loading={this.props.user.isUpdating}
                >
                  Save changes
                </Button>
                <Button type="ghost" htmlType="button" onClick={this.handleCancel}>
                  Cancel
                </Button>
              </Row>
            </Form>
            {this.state.showError &&
              this.props.user.updateError && (
                <Alert
                  className="ProfileEdit-alert"
                  message={`There was an error attempting to update your profile. (code ${
                    this.props.user.updateError
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

  private handleSave = (evt: React.SyntheticEvent<any>) => {
    evt.preventDefault();
    this.props.onEdit(this.state.fields);
  };

  private handleCancel = () => {
    const { avatarUrl } = this.state.fields;
    // cleanup uploaded file if we cancel
    if (this.props.user.avatarUrl !== avatarUrl && avatarUrl) {
      axios.delete('/api/v1/users/avatar', {
        params: { url: avatarUrl },
      });
    }
    this.props.onDone();
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

  private handleSocialChange = (
    ev: React.ChangeEvent<HTMLInputElement>,
    type: SOCIAL_TYPE,
  ) => {
    const { value } = ev.currentTarget;
    const fields = {
      ...this.state.fields,
      socialAccounts: {
        ...this.state.fields.socialAccounts,
        [type]: value,
      },
    };
    // delete key for empty string
    if (!value) {
      delete fields.socialAccounts[type];
    }
    const isChanged = this.isChangedCheck(fields);
    this.setState({
      isChanged,
      fields,
    });
  };

  private handleChangePhoto = (url: string) => {
    const fields = {
      ...this.state.fields,
      avatarUrl: url,
    };
    const isChanged = this.isChangedCheck(fields);
    this.setState({
      isChanged,
      fields,
    });
  };

  private handleDeletePhoto = () => {
    const fields = lodash.clone(this.state.fields);
    delete fields.avatarUrl;
    const isChanged = this.isChangedCheck(fields);
    this.setState({ isChanged, fields });
  };

  private isChangedCheck = (a: TeamMember) => {
    return !lodash.isEqual(a, this.props.user);
  };
}
