import React from 'react';
import { connect } from 'react-redux';
import { Icon, Form, Input, Button, Popconfirm } from 'antd';
import { TeamMember, ProposalDraft } from 'types';
import TeamMemberComponent from './TeamMember';
import { isValidEthAddress, isValidEmail } from 'utils/validators';
import { AppState } from 'store/reducers';
import './Team.less';

interface State {
  team: TeamMember[];
  teamInvites: string[];
  invite: string;
}

interface StateProps {
  authUser: AppState['auth']['user'];
}

interface OwnProps {
  initialState?: Partial<State>;
  updateForm(form: Partial<ProposalDraft>): void;
}

type Props = OwnProps & StateProps;

const MAX_TEAM_SIZE = 6;
const DEFAULT_STATE: State = {
  team: [
    {
      name: '',
      title: '',
      avatarUrl: '',
      ethAddress: '',
      emailAddress: '',
      socialAccounts: {},
    },
  ],
  teamInvites: [],
  invite: '',
};

class CreateFlowTeam extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...DEFAULT_STATE,
      ...(props.initialState || {}),
    };

    // Don't allow for empty team array
    if (!this.state.team.length) {
      this.state = {
        ...this.state,
        team: [...DEFAULT_STATE.team],
      };
    }

    // Auth'd user is always first member of a team
    if (props.authUser) {
      this.state.team[0] = {
        ...props.authUser,
      };
    }
  }

  render() {
    const { team, teamInvites, invite } = this.state;
    const inviteError =
      invite && !isValidEmail(invite) && !isValidEthAddress(invite)
        ? 'That doesn’t look like an email address or ETH address'
        : undefined;
    const inviteDisabled = !!inviteError || !invite;

    return (
      <div className="TeamForm">
        {team.map((user, idx) => (
          <TeamMemberComponent
            key={idx}
            index={idx}
            user={user}
            onRemove={this.removeMember}
          />
        ))}
        {!!teamInvites.length && (
          <div className="TeamForm-pending">
            <h3 className="TeamForm-pending-title">Pending invitations</h3>
            {teamInvites.map((ti, idx) => (
              <div key={ti} className="TeamForm-pending-invite">
                <div className="TeamForm-pending-invite-name">{ti}</div>
                <Popconfirm
                  title="Are you sure?"
                  onConfirm={() => this.removeInvitation(idx)}
                >
                  <button className="TeamForm-pending-invite-delete">
                    <Icon type="delete" />
                  </button>
                </Popconfirm>
              </div>
            ))}
          </div>
        )}
        {team.length < MAX_TEAM_SIZE && (
          <div className="TeamForm-add">
            <h3 className="TeamForm-add-title">Add a team member</h3>
            <Form className="TeamForm-add-form" onSubmit={this.handleAddSubmit}>
              <Form.Item
                className="TeamForm-add-form-field"
                validateStatus={inviteError ? 'error' : undefined}
                help={
                  inviteError ||
                  'They will be notified and will have to accept the invitation before being added'
                }
              >
                <Input
                  className="TeamForm-add-form-field-input"
                  placeholder="Email address or ETH address"
                  size="large"
                  value={invite}
                  onChange={this.handleChangeInvite}
                />
              </Form.Item>
              <Button
                className="TeamForm-add-form-submit"
                type="primary"
                disabled={inviteDisabled}
                htmlType="submit"
                icon="user-add"
                size="large"
              >
                Add
              </Button>
            </Form>
          </div>
        )}
      </div>
    );
  }

  private handleChangeInvite = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ invite: ev.currentTarget.value });
  };

  private handleAddSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const teamInvites = [...this.state.teamInvites, this.state.invite];
    this.setState({
      teamInvites,
      invite: '',
    });
    this.props.updateForm({ teamInvites });
  };

  private removeMember = (index: number) => {
    const team = [
      ...this.state.team.slice(0, index),
      ...this.state.team.slice(index + 1),
    ];
    this.setState({ team });
    this.props.updateForm({ team });
  };

  private removeInvitation = (index: number) => {
    const teamInvites = [
      ...this.state.teamInvites.slice(0, index),
      ...this.state.teamInvites.slice(index + 1),
    ];
    this.setState({ teamInvites });
    this.props.updateForm({ teamInvites });
  };
}

const withConnect = connect<StateProps, {}, {}, AppState>(state => ({
  authUser: state.auth.user,
}));

export default withConnect(CreateFlowTeam);
