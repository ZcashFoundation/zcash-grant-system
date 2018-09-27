import React from 'react';
import { connect } from 'react-redux';
import { Icon, Timeline } from 'antd';
import moment from 'moment';
import { getCreateErrors, KeyOfForm, FIELD_NAME_MAP } from 'modules/create/utils';
import Markdown from 'components/Markdown';
import { AppState } from 'store/reducers';
import { CREATE_STEP } from './index';
import { CATEGORY_UI } from 'api/constants';
import defaultUserImg from 'static/images/default-user.jpg';
import './Review.less';

interface OwnProps {
  setStep(step: CREATE_STEP): void;
}

interface StateProps {
  form: AppState['create']['form'];
}

type Props = OwnProps & StateProps;

interface Field {
  key: KeyOfForm;
  content: React.ReactNode;
  error: string | undefined | false;
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
    const catUI = CATEGORY_UI[form.category] || ({} as any);
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
            key: 'brief',
            content: form.brief,
            error: errors.brief,
          },
          {
            key: 'category',
            content: (
              <div style={{ color: catUI.color }}>
                <Icon type={catUI.icon} /> {catUI.label}
              </div>
            ),
            error: errors.category,
          },
          {
            key: 'amountToRaise',
            content: <div style={{ fontSize: '1.2rem' }}>{form.amountToRaise} ETH</div>,
            error: errors.amountToRaise,
          },
        ],
      },
      {
        step: CREATE_STEP.TEAM,
        name: 'Team',
        fields: [
          {
            key: 'team',
            content: <ReviewTeam team={form.team} />,
            error: errors.team && errors.team.join(' '),
          },
        ],
      },
      {
        step: CREATE_STEP.DETAILS,
        name: 'Details',
        fields: [
          {
            key: 'details',
            content: <Markdown source={form.details} />,
            error: errors.details,
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
        step: CREATE_STEP.GOVERNANCE,
        name: 'Governance',
        fields: [
          {
            key: 'payOutAddress',
            content: <code>{form.payOutAddress}</code>,
            error: errors.payOutAddress,
          },
          {
            key: 'trustees',
            content: form.trustees.map(t => (
              <div key={t}>
                <code>{t}</code>
              </div>
            )),
            error: errors.trustees && errors.trustees.join(' '),
          },
          {
            key: 'deadline',
            content: `${Math.floor(moment.duration(form.deadline * 1000).asDays())} days`,
            error: errors.deadline,
          },
          {
            key: 'milestoneDeadline',
            content: `${Math.floor(
              moment.duration(form.milestoneDeadline * 1000).asDays(),
            )} days`,
            error: errors.milestoneDeadline,
          },
        ],
      },
    ];

    return (
      <div className="CreateReview">
        {sections.map(s => (
          <div className="CreateReview-section">
            {s.fields.map(f => (
              <div className="ReviewField" key={f.key}>
                <div className="ReviewField-label">
                  {FIELD_NAME_MAP[f.key]}
                  {f.error && <div className="ReviewField-label-error">{f.error}</div>}
                </div>
                <div className="ReviewField-content">
                  {this.isEmpty(form[f.key]) ? (
                    <div className="ReviewField-content-empty">N/A</div>
                  ) : (
                    f.content
                  )}
                </div>
              </div>
            ))}
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
    return !value || value.length === 0;
  }
}

export default connect<StateProps, {}, OwnProps, AppState>(state => ({
  form: state.create.form,
}))(CreateReview);

const ReviewMilestones = ({
  milestones,
}: {
  milestones: AppState['create']['form']['milestones'];
}) => (
  <Timeline>
    {milestones.map(m => (
      <Timeline.Item>
        <div className="ReviewMilestone">
          <div className="ReviewMilestone-title">{m.title}</div>
          <div className="ReviewMilestone-info">
            {moment(m.date).format('MMMM YYYY')}
            {' – '}
            {m.payoutPercent}% of funds
          </div>
          <div className="ReviewMilestone-description">{m.description}</div>
        </div>
      </Timeline.Item>
    ))}
  </Timeline>
);

const ReviewTeam = ({ team }: { team: AppState['create']['form']['team'] }) => (
  <div className="ReviewTeam">
    {team.map((u, idx) => (
      <div className="ReviewTeam-member" key={idx}>
        <img className="ReviewTeam-member-avatar" src={u.avatarUrl || defaultUserImg} />
        <div className="ReviewTeam-member-info">
          <div className="ReviewTeam-member-info-name">{u.name}</div>
          <div className="ReviewTeam-member-info-title">{u.title}</div>
        </div>
      </div>
    ))}
  </div>
);
