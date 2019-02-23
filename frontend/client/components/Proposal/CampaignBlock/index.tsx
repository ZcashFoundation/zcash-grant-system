import React from 'react';
import moment from 'moment';
import { Form, Input, Button, Icon, Popover } from 'antd';
import { Proposal, STATUS } from 'types';
import classnames from 'classnames';
import { fromZat } from 'utils/units';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { AppState } from 'store/reducers';
import { withRouter } from 'react-router';
import UnitDisplay from 'components/UnitDisplay';
import ContributionModal from 'components/ContributionModal';
import Loader from 'components/Loader';
import { getAmountError } from 'utils/validators';
import { CATEGORY_UI, PROPOSAL_STAGE } from 'api/constants';
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
  isContributing: boolean;
}

export class ProposalCampaignBlock extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      amountToRaise: '',
      amountError: null,
      isContributing: false,
    };
  }

  render() {
    const { proposal, sendLoading, isPreview } = this.props;
    const { amountToRaise, amountError, isContributing } = this.state;
    const amountFloat = parseFloat(amountToRaise) || 0;
    let content;
    if (proposal) {
      const { target, funded, percentFunded } = proposal;
      const datePublished = proposal.datePublished || Date.now() / 1000;
      const isRaiseGoalReached = funded.gte(target);
      const deadline = (datePublished + proposal.deadlineDuration) * 1000;
      const isFrozen =
        proposal.stage === PROPOSAL_STAGE.FAILED ||
        proposal.stage === PROPOSAL_STAGE.CANCELED;
      const isLive = proposal.status === STATUS.LIVE;

      const isFundingOver = isRaiseGoalReached || deadline < Date.now() || isFrozen;
      const isDisabled = isFundingOver || !!amountError || !amountFloat || isPreview;
      const remainingTargetNum = parseFloat(fromZat(target.sub(funded)));

      // Get bounty from RFP. If it exceeds proposal target, show bounty as full amount
      let bounty;
      if (proposal.rfp && proposal.rfp.bounty) {
        bounty = proposal.rfp.bounty.gt(proposal.target)
          ? proposal.target
          : proposal.rfp.bounty;
      }

      content = (
        <React.Fragment>
          {isLive && (
            <div className="ProposalCampaignBlock-info">
              <div className="ProposalCampaignBlock-info-label">Started</div>
              <div className="ProposalCampaignBlock-info-value">
                {moment(datePublished * 1000).fromNow()}
              </div>
            </div>
          )}
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
              <UnitDisplay value={funded} /> / <UnitDisplay value={target} symbol="ZEC" />
            </div>
          </div>

          {bounty && (
            <div className="ProposalCampaignBlock-bounty">
              Awarded with <UnitDisplay value={bounty} symbol="ZEC" /> bounty
            </div>
          )}

          {proposal.contributionMatching > 0 && (
            <div className="ProposalCampaignBlock-matching">
              <span>Funds are being matched x{proposal.contributionMatching + 1}</span>
              <Popover
                overlayClassName="ProposalCampaignBlock-popover-overlay"
                placement="left"
                content={
                  <>
                    <b>Matching</b>
                    <br />
                    Increase your impact! Contributions to this proposal are being matched
                    by the Zcash Foundation, up to the target amount.
                  </>
                }
              >
                <Icon type="question-circle" theme="filled" />
              </Popover>
            </div>
          )}

          {isFundingOver ? (
            <div
              className={classnames({
                ['ProposalCampaignBlock-fundingOver']: true,
                ['is-success']: isRaiseGoalReached,
              })}
            >
              {proposal.stage === PROPOSAL_STAGE.CANCELED ? (
                <>
                  <Icon type="close-circle-o" />
                  <span>Proposal was canceled</span>
                </>
              ) : isRaiseGoalReached ? (
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
                  onClick={this.openContributionModal}
                  size="large"
                  type="primary"
                  disabled={isDisabled}
                  loading={sendLoading}
                  block
                >
                  Fund this project
                </Button>
              </Form>
            </>
          )}

          <ContributionModal
            isVisible={isContributing}
            proposalId={proposal.proposalId}
            amount={amountToRaise}
            handleClose={this.closeContributionModal}
          />
        </React.Fragment>
      );
    } else {
      content = <Loader />;
    }

    return (
      <div className="ProposalCampaignBlock Proposal-top-side-block">
        <h2 className="Proposal-top-main-block-title">Campaign</h2>
        <div className="Proposal-top-main-block">{content}</div>
      </div>
    );
  }

  private handleAmountChange = (
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

  private openContributionModal = () => this.setState({ isContributing: true });
  private closeContributionModal = () => this.setState({ isContributing: false });
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
