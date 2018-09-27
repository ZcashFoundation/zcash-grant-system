import React from 'react';
import { Icon } from 'antd';
import { CreateFormState, TeamMember } from 'modules/create/types';
import TeamMemberComponent from './TeamMember';
import './Team.less';

interface State {
  team: TeamMember[];
}

interface Props {
  initialState?: Partial<State>;
  updateForm(form: Partial<CreateFormState>): void;
}

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
};

export default class CreateFlowTeam extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...DEFAULT_STATE,
      ...(props.initialState || {}),
    };

    // Don't allow for empty team array
    // TODO: Default first user to auth'd user
    if (!this.state.team.length) {
      this.state = {
        ...this.state,
        team: [...DEFAULT_STATE.team],
      };
    }
  }

  render() {
    const { team } = this.state;

    return (
      <div className="TeamForm">
        {team.map((user, idx) => (
          <TeamMemberComponent
            key={idx}
            index={idx}
            user={user}
            initialEditingState={!user.name}
            onChange={this.handleChange}
            onRemove={this.removeMember}
          />
        ))}
        {team.length < MAX_TEAM_SIZE && (
          <button className="TeamForm-add" onClick={this.addMember}>
            <div className="TeamForm-add-icon">
              <Icon type="plus" />
            </div>
            <div className="TeamForm-add-text">
              <div className="TeamForm-add-text-title">Add a team member</div>
              <div className="TeamForm-add-text-subtitle">
                Find an existing user, or fill out their info yourself
              </div>
            </div>
          </button>
        )}
      </div>
    );
  }

  private handleChange = (user: TeamMember, idx: number) => {
    const team = [...this.state.team];
    team[idx] = user;
    this.setState({ team });
    this.props.updateForm({ team });
  };

  private addMember = () => {
    const team = [...this.state.team, { ...DEFAULT_STATE.team[0] }];
    this.setState({ team });
    this.props.updateForm({ team });
  };

  private removeMember = (index: number) => {
    const team = [
      ...this.state.team.slice(0, index),
      ...this.state.team.slice(index + 1),
    ];
    this.setState({ team });
    this.props.updateForm({ team });
  };
}
