import React from 'react';
import { connect } from 'react-redux';
import { Input, Form, Icon, Select, Alert, Popconfirm, message, Radio } from 'antd';
import { SelectValue } from 'antd/lib/select';
import { RadioChangeEvent } from 'antd/lib/radio';
import { PROPOSAL_CATEGORY, CATEGORY_UI } from 'api/constants';
import { ProposalDraft, RFP } from 'types';
import { getCreateErrors } from 'modules/create/utils';
import { typedKeys } from 'utils/ts';
import { Link } from 'react-router-dom';
import { unlinkProposalRFP } from 'modules/create/actions';
import { AppState } from 'store/reducers';

interface OwnProps {
  proposalId: number;
  initialState?: Partial<State>;
  updateForm(form: Partial<ProposalDraft>): void;
}

interface StateProps {
  isUnlinkingProposalRFP: AppState['create']['isUnlinkingProposalRFP'];
  unlinkProposalRFPError: AppState['create']['unlinkProposalRFPError'];
}

interface DispatchProps {
  unlinkProposalRFP: typeof unlinkProposalRFP;
}

type Props = OwnProps & StateProps & DispatchProps;

interface State extends Partial<ProposalDraft> {
  title: string;
  brief: string;
  category?: PROPOSAL_CATEGORY;
  target: string;
  rfp?: RFP;
}

class CreateFlowBasics extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      title: '',
      brief: '',
      category: undefined,
      target: '',
      ...(props.initialState || {}),
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { unlinkProposalRFPError, isUnlinkingProposalRFP } = this.props;
    if (
      unlinkProposalRFPError &&
      unlinkProposalRFPError !== prevProps.unlinkProposalRFPError
    ) {
      console.error('Failed to unlink request:', unlinkProposalRFPError);
      message.error('Failed to unlink request');
    } else if (!isUnlinkingProposalRFP && prevProps.isUnlinkingProposalRFP) {
      this.setState({ rfp: undefined });
      message.success('Unlinked proposal from request');
    }
  }

  render() {
    const { isUnlinkingProposalRFP } = this.props;
    const { title, brief, category, target, rfp, rfpOptIn } = this.state;
    const errors = getCreateErrors(this.state, true);

    // Don't show target error at zero since it defaults to that
    // Error just shows up at the end to prevent submission
    if (target === '0') {
      errors.target = undefined;
    }

    const rfpOptInRequired =
      rfp && (rfp.matching || (rfp.bounty && parseFloat(rfp.bounty.toString()) > 0));

    return (
      <Form layout="vertical" style={{ maxWidth: 600, margin: '0 auto' }}>
        {rfp && (
          <Alert
            className="CreateFlow-rfpAlert"
            type="info"
            message="This proposal is linked to a request"
            description={
              <>
                This proposal is for the open request{' '}
                <Link to={`/requests/${rfp.id}`} target="_blank">
                  {rfp.title}
                </Link>
                . If you didn’t mean to do this, or want to unlink it,{' '}
                <Popconfirm
                  title="Are you sure? This cannot be undone."
                  onConfirm={this.unlinkRfp}
                  okButtonProps={{ loading: isUnlinkingProposalRFP }}
                >
                  <a>click here</a>
                </Popconfirm>{' '}
                to do so.
              </>
            }
            showIcon
          />
        )}

        {rfpOptInRequired && (
          <Alert
            className="CreateFlow-rfpAlert"
            type="warning"
            message="KYC (know your customer)"
            description={
              <>
                <div>
                  This RFP offers either a bounty or matching. This will require ZFGrants
                  to fulfill{' '}
                  <a
                    target="_blank"
                    href="https://en.wikipedia.org/wiki/Know_your_customer"
                  >
                    KYC
                  </a>{' '}
                  due dilligence. In the event your proposal is successful, you will need
                  to provide identifying information to ZFGrants.
                  <Radio.Group onChange={this.handleRfpOptIn}>
                    <Radio value={true} checked={rfpOptIn && rfpOptIn === true}>
                      <b>Yes</b>, I am willing to provide KYC information
                    </Radio>
                    <Radio
                      value={false}
                      checked={rfpOptIn !== null && rfpOptIn === false}
                    >
                      <b>No</b>, I do not wish to provide KYC information and understand I
                      will not receive any matching or bounty funds from ZFGrants
                    </Radio>
                  </Radio.Group>
                </div>
              </>
            }
          />
        )}

        <Form.Item
          label="Title"
          validateStatus={errors.title ? 'error' : undefined}
          help={errors.title}
        >
          <Input
            size="large"
            name="title"
            placeholder="Short and sweet"
            type="text"
            value={title}
            onChange={this.handleInputChange}
            maxLength={200}
          />
        </Form.Item>

        <Form.Item
          label="Brief"
          validateStatus={errors.brief ? 'error' : undefined}
          help={errors.brief}
        >
          <Input.TextArea
            name="brief"
            placeholder="An elevator-pitch version of your proposal, max 140 chars"
            value={brief}
            onChange={this.handleInputChange}
            rows={3}
            maxLength={200}
          />
        </Form.Item>

        <Form.Item label="Category">
          <Select
            size="large"
            placeholder="Select a category"
            value={category || undefined}
            onChange={this.handleCategoryChange}
          >
            {typedKeys(PROPOSAL_CATEGORY).map(c => (
              <Select.Option value={c} key={c}>
                <Icon
                  type={CATEGORY_UI[c].icon}
                  style={{ color: CATEGORY_UI[c].color }}
                />{' '}
                {CATEGORY_UI[c].label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Target amount"
          validateStatus={errors.target ? 'error' : undefined}
          help={errors.target || 'This cannot be changed once your proposal starts'}
        >
          <Input
            size="large"
            name="target"
            placeholder="1.5"
            type="number"
            value={target}
            onChange={this.handleInputChange}
            addonAfter="ZEC"
            maxLength={16}
          />
        </Form.Item>
      </Form>
    );
  }

  private handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value, name } = event.currentTarget;
    this.setState({ [name]: value } as any, () => {
      this.props.updateForm(this.state);
    });
  };

  private handleCategoryChange = (value: SelectValue) => {
    this.setState({ category: value as PROPOSAL_CATEGORY }, () => {
      this.props.updateForm(this.state);
    });
  };

  private handleRfpOptIn = (e: RadioChangeEvent) => {
    this.setState({ rfpOptIn: e.target.value }, () => {
      this.props.updateForm(this.state);
    });
  };

  private unlinkRfp = () => {
    this.props.unlinkProposalRFP(this.props.proposalId);
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    isUnlinkingProposalRFP: state.create.isUnlinkingProposalRFP,
    unlinkProposalRFPError: state.create.unlinkProposalRFPError,
  }),
  { unlinkProposalRFP },
)(CreateFlowBasics);
