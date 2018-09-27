import React from 'react';
import classnames from 'classnames';
import { Input, Form, Col, Row, Button, Icon, Alert } from 'antd';
import { SOCIAL_TYPE, SOCIAL_INFO } from 'utils/social';
import { TeamMember } from 'modules/create/types';
import { getCreateTeamMemberError } from 'modules/create/utils';
import UserAvatar from 'components/UserAvatar';
import './TeamMember.less';

interface Props {
  index: number;
  user: TeamMember;
  initialEditingState?: boolean;
  onChange(user: TeamMember, index: number): void;
  onRemove(index: number): void;
}

interface State {
  fields: TeamMember;
  isEditing: boolean;
}

export default class CreateFlowTeamMember extends React.PureComponent<Props, State> {
  state: State = {
    fields: { ...this.props.user },
    isEditing: this.props.initialEditingState || false,
  };

  render() {
    const { user, index } = this.props;
    const { fields, isEditing } = this.state;
    const error = getCreateTeamMemberError(fields);
    const isMissingField =
      !fields.name || !fields.title || !fields.emailAddress || !fields.ethAddress;
    const isDisabled = !!error || isMissingField;

    return (
      <div className={classnames('TeamMember', isEditing && 'is-editing')}>
        <div className="TeamMember-avatar">
          <UserAvatar className="TeamMember-avatar-img" user={fields} />
          {isEditing && (
            <Button className="TeamMember-avatar-change" onClick={this.handleChangePhoto}>
              Change
            </Button>
          )}
        </div>
        <div className="TeamMember-info">
          {isEditing ? (
            <Form
              className="TeamMember-info-form"
              layout="vertical"
              onSubmit={this.toggleEditing}
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

              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item>
                    <Input
                      name="ethAddress"
                      autoComplete="ethAddress"
                      placeholder="Ethereum address (Required)"
                      value={fields.ethAddress}
                      onChange={this.handleChangeField}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item>
                    <Input
                      name="emailAddress"
                      placeholder="Email address (Required)"
                      type="email"
                      autoComplete="email"
                      value={fields.emailAddress}
                      onChange={this.handleChangeField}
                    />
                  </Form.Item>
                </Col>
              </Row>

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
                <Button type="primary" htmlType="submit" disabled={isDisabled}>
                  Save changes
                </Button>
                <Button type="ghost" htmlType="button" onClick={this.cancelEditing}>
                  Cancel
                </Button>
              </Row>
            </Form>
          ) : (
            <>
              <div className="TeamMember-info-name">{user.name || <em>No name</em>}</div>
              <div className="TeamMember-info-title">
                {user.title || <em>No title</em>}
              </div>
              <div className="TeamMember-info-social">
                {Object.values(SOCIAL_INFO).map(s => {
                  const account = user.socialAccounts[s.type];
                  const cn = classnames(
                    'TeamMember-info-social-icon',
                    account && 'is-active',
                  );
                  return (
                    <div key={s.name} className={cn}>
                      {s.icon}
                      {account && (
                        <Icon
                          className="TeamMember-info-social-icon-check"
                          type="check-circle"
                          theme="filled"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <button className="TeamMember-info-edit" onClick={this.toggleEditing}>
                <Icon type="form" /> Edit
              </button>
              {index !== 0 && (
                <button className="TeamMember-info-remove" onClick={this.removeMember}>
                  <Icon type="close-circle" theme="filled" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  private toggleEditing = (ev?: React.SyntheticEvent<any>) => {
    if (ev) {
      ev.preventDefault();
    }

    const { isEditing, fields } = this.state;
    if (isEditing) {
      // TODO: Check if valid first
      this.props.onChange(fields, this.props.index);
    }

    this.setState({ isEditing: !isEditing });
  };

  private cancelEditing = () => {
    this.setState({
      isEditing: false,
      fields: { ...this.props.user },
    });
  };

  private handleChangeField = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = ev.currentTarget;
    this.setState({
      fields: {
        ...this.state.fields,
        [name as any]: value,
      },
    });
  };

  private handleSocialChange = (
    ev: React.ChangeEvent<HTMLInputElement>,
    type: SOCIAL_TYPE,
  ) => {
    const { value } = ev.currentTarget;
    this.setState({
      fields: {
        ...this.state.fields,
        socialAccounts: {
          ...this.state.fields.socialAccounts,
          [type]: value,
        },
      },
    });
  };

  private handleChangePhoto = () => {
    // TODO: Actual file uploading
    const gender = ['men', 'women'][Math.floor(Math.random() * 2)];
    const num = Math.floor(Math.random() * 80);
    this.setState({
      fields: {
        ...this.state.fields,
        avatarUrl: `https://randomuser.me/api/portraits/${gender}/${num}.jpg`,
      },
    });
  };

  private removeMember = () => {
    this.props.onRemove(this.props.index);
  };
}
