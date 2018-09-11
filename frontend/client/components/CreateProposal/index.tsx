// TODO: Make each section its own page. Reduce size of this component!
import React from 'react';
import Web3Container, { Web3RenderProps } from 'lib/Web3Container';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { AppState } from 'store/reducers';
import { web3Actions } from 'modules/web3';
import { Button, Input, Form, Alert, Spin, Divider, Icon, Radio, Select } from 'antd';
import { PROPOSAL_CATEGORY, CATEGORY_UI } from 'api/constants';
import { RadioChangeEvent } from 'antd/lib/radio';
import TrusteeFields from './TrusteeFields';
import MilestoneFields, { Milestone } from './MilestoneFields';
import CreateSuccess from './CreateSuccess';
import { computePercentage } from 'utils/helpers';
import { getAmountError } from 'utils/validators';
import MarkdownEditor from 'components/MarkdownEditor';
import * as Styled from './styled';

interface StateProps {
  crowdFundLoading: AppState['web3']['crowdFundLoading'];
  crowdFundError: AppState['web3']['crowdFundError'];
  crowdFundCreatedAddress: AppState['web3']['crowdFundCreatedAddress'];
}

interface DispatchProps {
  createCrowdFund: typeof web3Actions['createCrowdFund'];
}

interface Web3Props {
  web3: Web3RenderProps['web3'];
  contract: Web3RenderProps['contracts'][0];
}

type Props = StateProps & DispatchProps & Web3Props;

interface Errors {
  title?: string;
  amountToRaise?: string;
  payOutAddress?: string;
  trustees?: string[];
  milestones?: string[];
}

interface State {
  title: string;
  proposalBody: string;
  category: PROPOSAL_CATEGORY | undefined;
  amountToRaise: string;
  payOutAddress: string;
  trustees: string[];
  milestones: Milestone[];
  deadline: number | null;
  milestoneDeadline: number | null;
}

const DEFAULT_STATE: State = {
  title: '',
  proposalBody: '',
  category: undefined,
  amountToRaise: '',
  payOutAddress: '',
  trustees: [],
  milestones: [
    {
      title: '',
      description: '',
      date: '',
      payoutPercent: 100,
      immediatePayout: false,
    },
  ],
  deadline: 60 * 60 * 24 * 60,
  milestoneDeadline: 60 * 60 * 24 * 7,
};

function milestoneToMilestoneAmount(milestone: Milestone, raiseGoal: number) {
  return computePercentage(raiseGoal, milestone.payoutPercent);
}

class CreateProposal extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = { ...DEFAULT_STATE };
  }

  componentWillUpdate() {
    if (this.props.crowdFundLoading) {
      this.setState({ ...DEFAULT_STATE });
    }
  }

  handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value, name } = event.currentTarget;
    this.setState({ [name]: value } as any);
  };

  handleProposalBodyChange = (markdown: string) => {
    this.setState({ proposalBody: markdown });
  };

  handleCategoryChange = (value: PROPOSAL_CATEGORY) => {
    this.setState({ category: value });
  };

  handleRadioChange = (event: RadioChangeEvent) => {
    const { value, name } = event.target;
    this.setState({ [name]: value } as any);
  };

  handleTrusteeChange = (index: number, value: string) => {
    const trustees = [...this.state.trustees];
    trustees[index] = value;
    this.setState({ trustees });
  };

  addTrustee = () => {
    const trustees = [...this.state.trustees, ''];
    this.setState({ trustees });
  };

  removeTrustee = (index: number) => {
    const trustees = this.state.trustees.filter((_, i) => i !== index);
    this.setState({ trustees });
  };

  handleMilestoneChange = (index: number, milestone: Milestone) => {
    const milestones = [...this.state.milestones];
    milestones[index] = milestone;
    this.setState({ milestones });
  };

  addMilestone = () => {
    const { milestones: oldMilestones } = this.state;
    const lastMilestone = oldMilestones[oldMilestones.length - 1];
    const halfPayout = lastMilestone.payoutPercent / 2;
    const milestones = [
      ...oldMilestones,
      {
        ...DEFAULT_STATE.milestones[0],
        payoutPercent: halfPayout,
      },
    ];
    milestones[milestones.length - 2] = {
      ...lastMilestone,
      payoutPercent: halfPayout,
    };
    this.setState({ milestones });
  };

  removeMilestone = (index: number) => {
    let milestones = this.state.milestones.filter((_, i) => i !== index);
    if (milestones.length === 0) {
      milestones = [...DEFAULT_STATE.milestones];
    }
    this.setState({ milestones });
  };

  createCrowdFund = async () => {
    const { contract, createCrowdFund, web3 } = this.props;
    const {
      title,
      proposalBody,
      amountToRaise,
      payOutAddress,
      trustees,
      deadline,
      milestoneDeadline,
      milestones,
      category,
    } = this.state;

    const backendData = { content: proposalBody, title, category };

    const targetInWei = web3.utils.toWei(String(amountToRaise), 'ether');
    const milestoneAmounts = milestones.map(milestone =>
      milestoneToMilestoneAmount(milestone, targetInWei),
    );
    const immediateFirstMilestonePayout = milestones[0].immediatePayout;

    const contractData = {
      ethAmount: targetInWei,
      payOutAddress,
      trusteesAddresses: trustees,
      milestoneAmounts,
      milestones,
      durationInMinutes: deadline,
      milestoneVotingPeriodInMinutes: milestoneDeadline,
      immediateFirstMilestonePayout,
    };

    createCrowdFund(contract, contractData, backendData);
  };

  // TODO: Replace me with ant form validation?
  getFormErrors = () => {
    const { web3 } = this.props;
    const { title, amountToRaise, payOutAddress, trustees, milestones } = this.state;
    const errors: Errors = {};

    // Title
    if (title.length > 60) {
      errors.title = 'Title can be 60 characters maximum';
    }

    // Amount to raise
    const amountFloat = parseFloat(amountToRaise);
    if (amountToRaise && !Number.isNaN(amountFloat)) {
      const amountError = getAmountError(amountFloat, 10);
      if (amountError) {
        errors.amountToRaise = amountError;
      }
    }

    // Payout address
    if (payOutAddress && !web3.utils.isAddress(payOutAddress)) {
      errors.payOutAddress = 'That doesn’t look like a valid address';
    }

    // Trustees
    let didTrusteeError = false;
    const trusteeErrors = trustees.map((address, idx) => {
      if (!address) {
        return '';
      }

      let err = '';
      if (!web3.utils.isAddress(address)) {
        err = 'That doesn’t look like a valid address';
      } else if (trustees.indexOf(address) !== idx) {
        err = 'That address is already a trustee';
      } else if (payOutAddress === address) {
        err = 'That address is already a trustee';
      }

      didTrusteeError = didTrusteeError || !!err;
      return err;
    });
    if (didTrusteeError) {
      errors.trustees = trusteeErrors;
    }

    // Milestones
    let didMilestoneError = false;
    let cumulativeMilestonePct = 0;
    const milestoneErrors = milestones.map((ms, idx) => {
      if (isMilestoneUnfilled(ms)) {
        didMilestoneError = true;
        return '';
      }

      let err = '';
      if (ms.title.length > 40) {
        err = 'Title length can be 40 characters maximum';
      } else if (ms.description.length > 200) {
        err = 'Description can be 200 characters maximum';
      }

      // Last one shows percentage errors
      cumulativeMilestonePct += ms.payoutPercent;
      if (idx === milestones.length - 1 && cumulativeMilestonePct !== 100) {
        err = `Payout percentages doesn’t add up to 100% (currently ${cumulativeMilestonePct}%)`;
      }

      didMilestoneError = didMilestoneError || !!err;
      return err;
    });
    if (didMilestoneError) {
      errors.milestones = milestoneErrors;
    }

    return errors;
  };

  render() {
    const { crowdFundLoading, crowdFundError, crowdFundCreatedAddress } = this.props;
    const {
      title,
      category,
      proposalBody,
      amountToRaise,
      payOutAddress,
      trustees,
      milestones,
      deadline,
      milestoneDeadline,
    } = this.state;

    if (crowdFundCreatedAddress) {
      return <CreateSuccess crowdFundCreatedAddress={crowdFundCreatedAddress} />;
    }

    const errors = this.getFormErrors();
    const hasErrors = Object.keys(errors).length !== 0;
    const isMissingFields =
      !title ||
      !category ||
      !proposalBody ||
      !amountToRaise ||
      trustees.includes('') ||
      !!milestones.find(isMilestoneUnfilled);
    const isDisabled = hasErrors || isMissingFields || crowdFundLoading;

    return (
      <Form layout="vertical">
        <Styled.Title>Create a proposal</Styled.Title>
        <Styled.HelpText>All fields are required</Styled.HelpText>

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
          />
        </Form.Item>

        <Form.Item label="Category">
          <Select
            size="large"
            placeholder="Select a category"
            value={category}
            onChange={this.handleCategoryChange}
          >
            {Object.keys(PROPOSAL_CATEGORY).map((c: PROPOSAL_CATEGORY) => (
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
          validateStatus={errors.amountToRaise ? 'error' : undefined}
          help={errors.amountToRaise}
        >
          <Input
            size="large"
            name="amountToRaise"
            placeholder="1.5"
            type="number"
            value={amountToRaise}
            onChange={this.handleInputChange}
            addonAfter="ETH"
          />
        </Form.Item>

        <Divider style={{ margin: '3rem 0' }}>Description</Divider>

        <Styled.BodyField>
          <MarkdownEditor onChange={this.handleProposalBodyChange} />
        </Styled.BodyField>

        <Divider style={{ margin: '3rem 0' }}>Addresses</Divider>

        <Form.Item
          label="Payout address"
          validateStatus={errors.payOutAddress ? 'error' : undefined}
          help={errors.payOutAddress}
        >
          <Input
            size="large"
            name="payOutAddress"
            placeholder="0xe12a34230e5e7fc73d094e52025135e4fbf24653"
            type="text"
            value={payOutAddress}
            onChange={this.handleInputChange}
          />
        </Form.Item>

        <Form.Item label="Trustee addresses">
          <Input
            placeholder="Payout address will also become a trustee"
            size="large"
            type="text"
            disabled
            value={payOutAddress}
          />
        </Form.Item>
        {trustees.map((address, idx) => (
          <TrusteeFields
            key={idx}
            value={address}
            index={idx}
            error={errors.trustees && errors.trustees[idx]}
            onChange={this.handleTrusteeChange}
            onRemove={this.removeTrustee}
          />
        ))}
        {trustees.length < 9 && (
          <Button type="dashed" onClick={this.addTrustee}>
            <Icon type="plus" /> Add another trustee
          </Button>
        )}

        <Divider style={{ margin: '3rem 0' }}>Milestones</Divider>

        {milestones.map((milestone, idx) => (
          <MilestoneFields
            key={idx}
            milestone={milestone}
            index={idx}
            error={errors.milestones && errors.milestones[idx]}
            onChange={this.handleMilestoneChange}
            onRemove={this.removeMilestone}
          />
        ))}

        {milestones.length < 10 && (
          <Button type="dashed" onClick={this.addMilestone}>
            <Icon type="plus" /> Add another milestone
          </Button>
        )}

        <Divider style={{ margin: '3rem 0' }}>Deadlines</Divider>

        <Form.Item label="Funding Deadline">
          <Radio.Group
            name="deadline"
            value={deadline}
            onChange={this.handleRadioChange}
            size="large"
            style={{ display: 'flex', textAlign: 'center' }}
          >
            <Radio.Button style={{ flex: 1 }} value={60 * 60 * 24 * 30}>
              30 Days
            </Radio.Button>
            <Radio.Button style={{ flex: 1 }} value={60 * 60 * 24 * 60}>
              60 Days
            </Radio.Button>
            <Radio.Button style={{ flex: 1 }} value={60 * 60 * 24 * 90}>
              90 Days
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Milestone Voting Period">
          <Radio.Group
            name="milestoneDeadline"
            value={milestoneDeadline}
            onChange={this.handleRadioChange}
            size="large"
            style={{ display: 'flex', textAlign: 'center' }}
          >
            <Radio.Button style={{ flex: 1 }} value={60 * 60 * 24 * 3}>
              3 Days
            </Radio.Button>
            <Radio.Button style={{ flex: 1 }} value={60 * 60 * 24 * 7}>
              7 Days
            </Radio.Button>
            <Radio.Button style={{ flex: 1 }} value={60 * 60 * 24 * 10}>
              10 Days
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        {crowdFundError && (
          <Alert
            style={{ marginBottom: '2rem' }}
            message="Something went wrong"
            description={crowdFundError}
            type="error"
            showIcon
          />
        )}

        <Button
          onClick={this.createCrowdFund}
          size="large"
          type="primary"
          disabled={isDisabled}
          style={{ marginTop: '3rem' }}
          block
        >
          {crowdFundLoading ? <Spin /> : 'Create Proposal'}
        </Button>

        {isMissingFields && (
          <Alert
            message="It looks like some fields are still missing. All fields are required."
            type="info"
            style={{ marginTop: '1rem' }}
            showIcon
          />
        )}

        {!isMissingFields &&
          hasErrors && (
            <Alert
              message="It looks like some fields still have errors. They must be fixed before continuing."
              type="error"
              style={{ marginTop: '1rem' }}
              showIcon
            />
          )}
      </Form>
    );
  }
}

function isMilestoneUnfilled(milestone: Milestone) {
  return !milestone.title || !milestone.description || !milestone.date;
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(web3Actions, dispatch);
}

function mapStateToProps(state: AppState) {
  return {
    crowdFundLoading: state.web3.crowdFundLoading,
    crowdFundError: state.web3.crowdFundError,
    crowdFundCreatedAddress: state.web3.crowdFundCreatedAddress,
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const ConnectedCreateProposal = compose<Props, Web3Props>(withConnect)(CreateProposal);

export default () => (
  <Web3Container
    renderLoading={() => <div>Loading Dapp Page...</div>}
    render={({ web3, contracts }) => (
      <ConnectedCreateProposal contract={contracts[0]} web3={web3} />
    )}
  />
);
