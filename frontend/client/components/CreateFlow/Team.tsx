import React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'antd';
import { TeamMember, ProposalDraft } from 'types';
import TeamMemberComponent from './TeamMember';
import './Team.less';
import { AppState } from 'store/reducers';

interface State {
  team: TeamMember[];
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
      </div>
    );
  }

  private handleChange = (user: TeamMember, idx: number) => {
    const team = [...this.state.team];
    team[idx] = user;
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

const withConnect = connect<StateProps, {}, {}, AppState>(state => ({
  authUser: state.auth.user,
}));

export default withConnect(CreateFlowTeam);
