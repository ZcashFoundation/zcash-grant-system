import React from 'react';
import { connect } from 'react-redux';
import { Input, Form, Alert, Popconfirm, message, Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import { ProposalDraft, RFP } from 'types';
import { getCreateErrors } from 'modules/create/utils';
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
  target: string;
  rfp?: RFP;
}

class CreateFlowBasics extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      title: '',
      brief: '',
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
    const { title, brief, target, rfp, rfpOptIn } = this.state;
    if (rfp && rfp.bounty && (target === null || target === '0')) {
      this.setState({ target: rfp.bounty.toString() });
    }
    const errors = getCreateErrors(this.state, true);

    // Don't show target error at zero since it defaults to that
    // Error just shows up at the end to prevent submission
    if (target === '0') {
      errors.target = undefined;
    }

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

        <Alert
          className="CreateFlow-rfpAlert"
          type="warning"
          message="KYC (know your customer)"
          description={
            <>
              <div>
                In the event your proposal is accepted with funding, you will need to
                provide identifying information to the Zcash Foundation.
                <Radio.Group onChange={this.handleRfpOptIn}>
                  <Radio value={true} checked={rfpOptIn && rfpOptIn === true}>
                    <b>Yes</b>, I am willing to provide KYC information
                  </Radio>
                  <Radio value={false} checked={rfpOptIn !== null && rfpOptIn === false}>
                    <b>No</b>, I do not wish to provide KYC information and understand my
                    proposal may still be posted on ZF Grants, but I will not be eligible
                    to funding from the Zcash Foundation.
                  </Radio>
                </Radio.Group>
              </div>
            </>
          }
        />

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

        <Form.Item
          label="Target amount"
          validateStatus={errors.target ? 'error' : undefined}
          help={
            errors.target ||
            'You will be paid out in ZEC at market price at payout time. This cannot be changed once your proposal starts'
          }
        >
          <Input
            size="large"
            name="target"
            placeholder="1.5"
            type="number"
            value={target}
            onChange={this.handleInputChange}
            addonBefore="$"
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
