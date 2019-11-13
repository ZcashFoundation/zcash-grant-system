import React from 'react';
import { connect } from 'react-redux';
import { Timeline } from 'antd';
import { getCreateErrors, KeyOfForm, FIELD_NAME_MAP } from 'modules/create/utils';
import Markdown from 'components/Markdown';
import UserAvatar from 'components/UserAvatar';
import { AppState } from 'store/reducers';
import { CREATE_STEP } from './index';
import { ProposalDraft } from 'types';
import './Review.less';

interface OwnProps {
  setStep(step: CREATE_STEP): void;
}

interface StateProps {
  form: ProposalDraft;
}

type Props = OwnProps & StateProps;

interface Field {
  key: KeyOfForm;
  content: React.ReactNode;
  error: string | Falsy;
  isHide?: boolean;
}

interface Section {
  step: CREATE_STEP;
  name: string;
  fields: Field[];
}

class CreateReview extends React.Component<Props> {
  render() {
    const { form } = this.props;
    const errors = getCreateErrors(this.props.form);
    const sections: Section[] = [
      {
        step: CREATE_STEP.BASICS,
        name: 'Basics',
        fields: [
          {
            key: 'title',
            content: <h2 style={{ fontSize: '1.6rem', margin: 0 }}>{form.title}</h2>,
            error: errors.title,
          },
          {
            key: 'rfpOptIn',
            content: <div>{form.rfpOptIn ? 'Accepted' : 'Declined'}</div>,
            error: errors.rfpOptIn,
            isHide: !form.rfp || (form.rfp && !form.rfp.matching && !form.rfp.bounty),
          },
          {
            key: 'brief',
            content: form.brief,
            error: errors.brief,
          },
          {
            key: 'target',
            content: <div style={{ fontSize: '1.2rem' }}>{form.target} ZEC</div>,
            error: errors.target,
          },
        ],
      },
      {
        step: CREATE_STEP.TEAM,
        name: 'Team',
        fields: [
          {
            key: 'team',
            content: <ReviewTeam team={form.team} invites={form.invites} />,
            error: errors.team && errors.team.join(' '),
          },
        ],
      },
      {
        step: CREATE_STEP.DETAILS,
        name: 'Details',
        fields: [
          {
            key: 'content',
            content: <Markdown source={form.content} />,
            error: errors.content,
          },
        ],
      },
      {
        step: CREATE_STEP.MILESTONES,
        name: 'Milestones',
        fields: [
          {
            key: 'milestones',
            content: <ReviewMilestones milestones={form.milestones} />,
            error: errors.milestones && errors.milestones.join(' '),
          },
        ],
      },
      {
        step: CREATE_STEP.PAYMENT,
        name: 'Payment',
        fields: [
          {
            key: 'payoutAddress',
            content: <code>{form.payoutAddress}</code>,
            error: errors.payoutAddress,
          },
        ],
      },
    ];

    return (
      <div className="CreateReview">
        {sections.map(s => (
          <div className="CreateReview-section" key={s.step}>
            {s.fields.map(
              f =>
                !f.isHide && (
                  <div className="ReviewField" key={f.key}>
                    <div className="ReviewField-label">
                      {FIELD_NAME_MAP[f.key]}
                      {f.error && (
                        <div className="ReviewField-label-error">{f.error}</div>
                      )}
                    </div>
                    <div className="ReviewField-content">
                      {this.isEmpty(form[f.key]) ? (
                        <div className="ReviewField-content-empty">N/A</div>
                      ) : (
                        f.content
                      )}
                    </div>
                  </div>
                ),
            )}
            <div className="ReviewField">
              <div className="ReviewField-label" />
              <div className="ReviewField-content">
                <button
                  className="ReviewField-content-edit"
                  onClick={() => this.setStep(s.step)}
                >
                  Edit {s.name}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  private setStep = (step: CREATE_STEP) => {
    this.props.setStep(step);
  };

  private isEmpty(value: any) {
    if (typeof value === 'boolean') {
      return false; // defined booleans are never empty
    }
    return !value || value.length === 0;
  }
}

export default connect<StateProps, {}, OwnProps, AppState>(state => ({
  form: state.create.form as ProposalDraft,
}))(CreateReview);

const ReviewMilestones = ({
  milestones,
}: {
  milestones: ProposalDraft['milestones'];
}) => (
  <Timeline>
    {milestones.map(m => (
      <Timeline.Item key={m.title}>
        <div className="ReviewMilestone">
          <div className="ReviewMilestone-title">{m.title || <em>No title</em>}</div>
          <div className="ReviewMilestone-info">
            {m.immediatePayout || !m.daysEstimated ? '0' : m.daysEstimated} days
            {' – '}
            {m.payoutPercent || '0'}% of funds
          </div>
          <div className="ReviewMilestone-description">
            {m.content || <em>No description</em>}
          </div>
        </div>
      </Timeline.Item>
    ))}
  </Timeline>
);

const ReviewTeam: React.SFC<{
  team: ProposalDraft['team'];
  invites: ProposalDraft['invites'];
}> = ({ team, invites }) => {
  const pendingInvites = invites.filter(inv => inv.accepted === null).length;
  return (
    <div className="ReviewTeam">
      {team.map((u, idx) => (
        <div className="ReviewTeam-member" key={idx}>
          <UserAvatar className="ReviewTeam-member-avatar" user={u} />
          <div className="ReviewTeam-member-info">
            <div className="ReviewTeam-member-info-name">{u.displayName}</div>
            <div className="ReviewTeam-member-info-title">{u.title}</div>
          </div>
        </div>
      ))}
      {!!pendingInvites && (
        <div className="ReviewTeam-invites">+ {pendingInvites} invite(s) pending</div>
      )}
    </div>
  );
};
