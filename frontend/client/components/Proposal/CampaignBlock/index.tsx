import React from 'react';
import moment from 'moment';
import { Spin, Form, Input, Button, Icon } from 'antd';
import { Proposal } from 'types';
import classnames from 'classnames';
import { fromZat } from 'utils/units';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { AppState } from 'store/reducers';
import { withRouter } from 'react-router';
import UnitDisplay from 'components/UnitDisplay';
import { getAmountError } from 'utils/validators';
import { CATEGORY_UI } from 'api/constants';
import MetaMaskRequiredButton from 'components/MetaMaskRequiredButton';
import './style.less';

interface OwnProps {
  proposal: Proposal;
  isPreview?: boolean;
}

interface StateProps {
  sendLoading: boolean;
}

type Props = OwnProps & StateProps;

interface State {
  amountToRaise: string;
  amountError: string | null;
}

export class ProposalCampaignBlock extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      amountToRaise: '',
      amountError: null,
    };
  }

  handleAmountChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value } = event.currentTarget;
    if (!value) {
      this.setState({ amountToRaise: '', amountError: null });
      return;
    }

    // TODO: Get values from proposal
    const { target, funded } = this.props.proposal;
    const remainingTarget = target.sub(funded);
    const amount = parseFloat(value);
    let amountError = null;

    if (Number.isNaN(amount)) {
      // They're entering some garbage, they’ll work it out
    } else {
      const remainingTargetNum = parseFloat(fromZat(remainingTarget));
      amountError = getAmountError(amount, remainingTargetNum);
    }

    this.setState({ amountToRaise: value, amountError });
  };

  sendTransaction = () => {
    const { proposal } = this.props;
    console.warn('TODO - remove, implement or refactor sendTransaction', proposal);

    this.setState({ amountToRaise: '' });
  };

  render() {
    const { proposal, sendLoading, isPreview } = this.props;
    const { amountToRaise, amountError } = this.state;
    const amountFloat = parseFloat(amountToRaise) || 0;
    let content;
    if (proposal) {
      console.warn('TODO: Get real values from proposal for CampaignBlock');
      const { target, funded, percentFunded } = proposal;
      const isRaiseGoalReached = funded.gte(target);
      // TODO: Get values from proposal
      console.warn('TODO: Get deadline and isFrozen from proposal data');
      const deadline = 0;
      const isFrozen = false;

      const isFundingOver =
        isRaiseGoalReached ||
        deadline < Date.now() ||
        isFrozen;
      const isDisabled = isFundingOver || !!amountError || !amountFloat || isPreview;
      const remainingTargetNum = parseFloat(fromZat(target.sub(funded)));

      content = (
        <React.Fragment>
          <div className="ProposalCampaignBlock-info">
            <div className="ProposalCampaignBlock-info-label">Started</div>
            <div className="ProposalCampaignBlock-info-value">
              {moment(proposal.dateCreated * 1000).fromNow()}
            </div>
          </div>
          <div className="ProposalCampaignBlock-info">
            <div className="ProposalCampaignBlock-info-label">Category</div>
            <div className="ProposalCampaignBlock-info-value">
              <Icon
                type={CATEGORY_UI[proposal.category].icon}
                style={{ color: CATEGORY_UI[proposal.category].color }}
              />{' '}
              {CATEGORY_UI[proposal.category].label}
            </div>
          </div>
          {!isFundingOver && (
            <div className="ProposalCampaignBlock-info">
              <div className="ProposalCampaignBlock-info-label">Deadline</div>
              <div className="ProposalCampaignBlock-info-value">
                {moment(deadline).fromNow()}
              </div>
            </div>
          )}
          <div className="ProposalCampaignBlock-info">
            <div className="ProposalCampaignBlock-info-label">Funding</div>
            <div className="ProposalCampaignBlock-info-value">
              <UnitDisplay value={funded} /> /{' '}
              <UnitDisplay value={target} symbol="ZEC" />
            </div>
          </div>

          {isFundingOver ? (
            <div
              className={classnames({
                ['ProposalCampaignBlock-fundingOver']: true,
                ['is-success']: isRaiseGoalReached,
              })}
            >
              {isRaiseGoalReached ? (
                <>
                  <Icon type="check-circle-o" />
                  <span>Proposal has been funded</span>
                </>
              ) : (
                <>
                  <Icon type="close-circle-o" />
                  <span>Proposal didn’t get funded</span>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="ProposalCampaignBlock-bar">
                <div
                  className="ProposalCampaignBlock-bar-inner"
                  style={{
                    width: `${percentFunded}%`,
                  }}
                />
              </div>

              <Form layout="vertical">
                <MetaMaskRequiredButton
                  message={
                    <Form.Item style={{ marginBottom: '0.5rem', paddingBottom: 0 }}>
                      <Input
                        size="large"
                        type="number"
                        placeholder="0.5"
                        addonAfter="ZEC"
                        disabled={true}
                      />
                    </Form.Item>
                  }
                >
                  <Form.Item
                    validateStatus={amountError ? 'error' : undefined}
                    help={amountError}
                    style={{ marginBottom: '0.5rem', paddingBottom: 0 }}
                  >
                    <Input
                      size="large"
                      name="amountToRaise"
                      type="number"
                      value={amountToRaise}
                      placeholder="0.5"
                      min={0}
                      max={remainingTargetNum}
                      step={0.1}
                      onChange={this.handleAmountChange}
                      addonAfter="ZEC"
                      disabled={isPreview}
                    />
                  </Form.Item>
                  <Button
                    onClick={this.sendTransaction}
                    size="large"
                    type="primary"
                    disabled={isDisabled}
                    loading={sendLoading}
                    block
                  >
                    Fund this project
                  </Button>
                </MetaMaskRequiredButton>
              </Form>
            </>
          )}
        </React.Fragment>
      );
    } else {
      content = <Spin />;
    }

    return (
      <div className="ProposalCampaignBlock Proposal-top-side-block">
        <h1 className="Proposal-top-main-block-title">Campaign</h1>
        <div className="Proposal-top-main-block">{content}</div>
      </div>
    );
  }
}

function mapStateToProps(state: AppState) {
  console.warn('TODO - new redux flag for sendLoading?', state);
  return {
    sendLoading: false,
  };
}

const withConnect = connect(mapStateToProps);

const ConnectedProposalCampaignBlock = compose<Props, OwnProps>(
  withRouter,
  withConnect,
)(ProposalCampaignBlock);

export default ConnectedProposalCampaignBlock;
