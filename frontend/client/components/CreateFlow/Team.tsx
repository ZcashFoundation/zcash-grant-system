import React from 'react';
import { connect } from 'react-redux';
import { Icon, Form, Input, Button, Popconfirm, message } from 'antd';
import { ProposalDraft, STATUS } from 'types';
import TeamMemberComponent from './TeamMember';
import { postProposalInvite, deleteProposalInvite } from 'api/api';
import { isValidEmail } from 'utils/validators';
import { AppState } from 'store/reducers';
import './Team.less';

interface State {
  address: string;
}

interface StateProps {
  authUser: AppState['auth']['user'];
  form: ProposalDraft;
}

interface OwnProps {
  proposalId: number;
  initialState?: Partial<State>;
  updateForm(form: Partial<ProposalDraft>): void;
}

type Props = OwnProps & StateProps;

const MAX_TEAM_SIZE = 6;
const DEFAULT_STATE: State = {
  address: '',
};

class CreateFlowTeam extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...DEFAULT_STATE,
      ...(props.initialState || {}),
    };
  }

  componentWillMount() {
    const {
      form: { team },
      authUser,
      updateForm,
    } = this.props;
    // Auth'd user is always first member of a team
    if (authUser && !team.length) {
      updateForm({
        team: [{ ...authUser }],
      });
    }
  }

  render() {
    const { address } = this.state;
    const { team, invites } = this.props.form;
    const inviteError =
      address && !isValidEmail(address) && 'That doesn’t look like a valid email address';
    const maxedOut = invites.length >= MAX_TEAM_SIZE - 1;
    const inviteDisabled = !!inviteError || !address || maxedOut;
    const pendingInvites = invites.filter(inv => inv.accepted === null);
    const isEdit = this.props.form.status === STATUS.LIVE_DRAFT;

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
          <h3 className="TeamForm-add-title">
            {!isEdit
              ? 'Add an optional team member'
              : 'Your team will be locked in unless you choose to edit the proposal again'}
          </h3>
          <Form className="TeamForm-add-form" onSubmit={this.handleAddSubmit}>
            <Form.Item
              className="TeamForm-add-form-field"
              validateStatus={inviteError ? 'error' : undefined}
              help={
                inviteError ||
                (maxedOut && 'You’ve invited the maximum number of teammates') ||
                'They will be notified immediately and will have to accept the invitation before being added'
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
        const invites = [...this.props.form.invites, res.data];
        this.setState({
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
        const invites = this.props.form.invites.filter(inv => inv.id !== invId);
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
  form: state.create.form as ProposalDraft,
}));

export default withConnect(CreateFlowTeam);
