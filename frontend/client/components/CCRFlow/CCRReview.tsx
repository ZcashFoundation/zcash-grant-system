import React from 'react';
import { connect } from 'react-redux';
import { FIELD_NAME_MAP, getCCRErrors, KeyOfForm } from 'modules/ccr/utils';
import Markdown from 'components/Markdown';
import { AppState } from 'store/reducers';
import { CCR_STEP } from './index';
import { CCRDraft } from 'types';
import { formatUsd } from 'utils/formatters'
import './CCRReview.less';

interface OwnProps {
  setStep(step: CCR_STEP): void;
}

interface StateProps {
  form: CCRDraft;
}

type Props = OwnProps & StateProps;

interface Field {
  key: KeyOfForm;
  content: React.ReactNode;
  error: string | Falsy;
  isHide?: boolean;
}

interface Section {
  step: CCR_STEP;
  name: string;
  fields: Field[];
}

class CCRReview extends React.Component<Props> {
  render() {
    const { form } = this.props;
    const errors = getCCRErrors(this.props.form);
    const sections: Section[] = [
      {
        step: CCR_STEP.BASICS,
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
            key: 'target',
            content: <div style={{ fontSize: '1.2rem' }}>{formatUsd(form.target)}</div>,
            error: errors.target,
          },
        ],
      },

      {
        step: CCR_STEP.DETAILS,
        name: 'Details',
        fields: [
          {
            key: 'content',
            content: <Markdown source={form.content} />,
            error: errors.content,
          },
        ],
      },
    ];

    return (
      <div className="CCRReview">
        {sections.map(s => (
          <div className="CCRReview-section" key={s.step}>
            {s.fields.map(
              f =>
                !f.isHide && (
                  <div className="CCRReviewField" key={f.key}>
                    <div className="CCRReviewField-label">
                      {FIELD_NAME_MAP[f.key]}
                      {f.error && (
                        <div className="CCRReviewField-label-error">{f.error}</div>
                      )}
                    </div>
                    <div className="CCRReviewField-content">
                      {this.isEmpty(form[f.key]) ? (
                        <div className="CCRReviewField-content-empty">N/A</div>
                      ) : (
                        f.content
                      )}
                    </div>
                  </div>
                ),
            )}
            <div className="CCRReviewField">
              <div className="CCRReviewField-label" />
              <div className="CCRReviewField-content">
                <button
                  className="CCRReviewField-content-edit"
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

  private setStep = (step: CCR_STEP) => {
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
  form: state.ccr.form as CCRDraft,
}))(CCRReview);
