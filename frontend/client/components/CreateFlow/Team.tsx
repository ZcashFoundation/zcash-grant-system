import React from 'react';
import { connect } from 'react-redux';
import { Icon, Form, Input, Button, Popconfirm, message } from 'antd';
import { User, TeamInvite, ProposalDraft } from 'types';
import TeamMemberComponent from './TeamMember';
import { postProposalInvite, deleteProposalInvite } from 'api/api';
import { isValidEmail } from 'utils/validators';
import { AppState } from 'store/reducers';
import './Team.less';

interface State {
  team: User[];
  invites: TeamInvite[];
  address: string;
}

interface StateProps {
  authUser: AppState['auth']['user'];
}

interface OwnProps {
  proposalId: number;
  initialState?: Partial<State>;
  updateForm(form: Partial<ProposalDraft>): void;
}

type Props = OwnProps & StateProps;

const MAX_TEAM_SIZE = 6;
const DEFAULT_STATE: State = {
  team: [],
  invites: [],
  address: '',
};

class CreateFlowTeam extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...DEFAULT_STATE,
      ...(props.initialState || {}),
    };

    // Auth'd user is always first member of a team
    if (props.authUser && !this.state.team.length) {
      this.state.team[0] = {
        ...props.authUser,
      };
    }
  }

  render() {
    const { team, invites, address } = this.state;
    const inviteError =
      address && !isValidEmail(address) && 'That doesn’t look like a valid email address';
    const maxedOut = invites.length >= MAX_TEAM_SIZE - 1;
    const inviteDisabled = !!inviteError || !address || maxedOut;
    const pendingInvites = invites.filter(inv => inv.accepted === null);

    return (
      <div className="TeamForm">
        {team.map(user => (
          <TeamMemberComponent key={user.userid} user={user} />
        ))}
        {!!pendingInvites.length && (
          <div className="TeamForm-pending">
            <h3 className="TeamForm-pending-title">Pending invitations</h3>
            {pendingInvites.map(inv => (
              <div key={inv.id} className="TeamForm-pending-invite">
                <div className="TeamForm-pending-invite-name">{inv.address}</div>
                <Popconfirm
                  title="Are you sure?"
                  onConfirm={() => this.removeInvitation(inv.id)}
                >
                  <button className="TeamForm-pending-invite-delete">
                    <Icon type="delete" />
                  </button>
                </Popconfirm>
              </div>
            ))}
          </div>
        )}
        <div className="TeamForm-add">
          <h3 className="TeamForm-add-title">Add an optional team member</h3>
          <Form className="TeamForm-add-form" onSubmit={this.handleAddSubmit}>
            <Form.Item
              className="TeamForm-add-form-field"
              validateStatus={inviteError ? 'error' : undefined}
              help={
                inviteError ||
                (maxedOut && 'You’ve invited the maximum number of teammates') ||
                'They will be notified and will have to accept the invitation before being added'
              }
            >
              <Input
                className="TeamForm-add-form-field-input"
                placeholder="Email address"
                size="large"
                value={address}
                onChange={this.handleChangeInviteAddress}
                disabled={maxedOut}
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
      </div>
    );
  }

  private handleChangeInviteAddress = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ address: ev.currentTarget.value });
  };

  private handleAddSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    postProposalInvite(this.props.proposalId, this.state.address)
      .then(res => {
        const invites = [...this.state.invites, res.data];
        this.setState({
          invites,
          address: '',
        });
        this.props.updateForm({ invites });
      })
      .catch((err: Error) => {
        console.error('Failed to send invite', err);
        message.error(err.message, 3);
      });
  };

  private removeInvitation = (invId: number) => {
    deleteProposalInvite(this.props.proposalId, invId)
      .then(() => {
        const invites = this.state.invites.filter(inv => inv.id !== invId);
        this.setState({ invites });
        this.props.updateForm({ invites });
      })
      .catch((err: Error) => {
        console.error('Failed to remove invite', err);
        message.error(err.message, 3);
      });
  };
}

const withConnect = connect<StateProps, {}, {}, AppState>(state => ({
  authUser: state.auth.user,
}));

export default withConnect(CreateFlowTeam);
