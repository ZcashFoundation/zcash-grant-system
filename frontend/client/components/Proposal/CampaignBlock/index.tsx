import React from 'react';
import moment from 'moment';
import { Icon, Popover, Tooltip } from 'antd';
import { Proposal, STATUS } from 'types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { AppState } from 'store/reducers';
import { withRouter } from 'react-router';
import UnitDisplay from 'components/UnitDisplay';
import Loader from 'components/Loader';
import { PROPOSAL_STAGE } from 'api/constants';
import { formatUsd } from 'utils/formatters';
import ZFGrantsLogo from 'static/images/logo-name-light.svg';
import './style.less';

interface OwnProps {
  proposal: Proposal;
  isPreview?: boolean;
}

interface StateProps {
  authUser: AppState['auth']['user'];
}

type Props = OwnProps & StateProps;

interface State {
  amountToRaise: string;
  amountError: string | null;
  isPrivate: boolean;
  isContributing: boolean;
}

export class ProposalCampaignBlock extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      amountToRaise: '',
      amountError: null,
      isPrivate: true,
      isContributing: false,
    };
  }

  render() {
    const { proposal } = this.props;
    let content;
    if (proposal) {
      const { target, funded, percentFunded, isVersionTwo } = proposal;
      const datePublished = proposal.datePublished || Date.now() / 1000;
      const isRaiseGoalReached = funded.gte(target);
      const deadline = proposal.deadlineDuration
        ? (datePublished + proposal.deadlineDuration) * 1000
        : 0;
      const isFrozen =
        proposal.stage === PROPOSAL_STAGE.FAILED ||
        proposal.stage === PROPOSAL_STAGE.CANCELED;
      const isLive = proposal.status === STATUS.LIVE;

      const isFundingOver = deadline
        ? isRaiseGoalReached || deadline < Date.now() || isFrozen
        : null;

      // Get bounty from RFP. If it exceeds proposal target, show bounty as full amount
      let bounty;
      if (proposal.contributionBounty && proposal.contributionBounty.gtn(0)) {
        bounty = proposal.contributionBounty.gt(proposal.target)
          ? proposal.target
          : proposal.contributionBounty;
      }

      const isAcceptedWithFunding = proposal.acceptedWithFunding === true;
      const isCanceled = proposal.stage === PROPOSAL_STAGE.CANCELED;

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
          {!isVersionTwo &&
            !isFundingOver && (
              <div className="ProposalCampaignBlock-info">
                <div className="ProposalCampaignBlock-info-label">Deadline</div>
                <div className="ProposalCampaignBlock-info-value">
                  {moment(deadline).fromNow()}
                </div>
              </div>
            )}
          {!isVersionTwo && (
            <div className="ProposalCampaignBlock-info">
              <div className="ProposalCampaignBlock-info-label">Funding</div>
              <div className="ProposalCampaignBlock-info-value">
                <UnitDisplay value={funded} /> /{' '}
                <UnitDisplay value={target} symbol="ZEC" />
              </div>
            </div>
          )}

          {isVersionTwo && (
            <div className="ProposalCampaignBlock-info">
              <div className="ProposalCampaignBlock-info-label">
                {isAcceptedWithFunding ? 'Funding' : 'Requested Funding'}
              </div>
              <div className="ProposalCampaignBlock-info-value">
                {formatUsd(target.toString(10))}
                {isAcceptedWithFunding && (
                  <Tooltip
                    placement="left"
                    title="Proposal owners will be paid out in ZEC at market price at payout time"
                  >
                    &nbsp; <Icon type="info-circle" />
                  </Tooltip>
                )}
              </div>
            </div>
          )}

          {bounty &&
            !isVersionTwo && (
              <div className="ProposalCampaignBlock-bounty">
                Awarded with <UnitDisplay value={bounty} symbol="ZEC" /> bounty
              </div>
            )}

          {isVersionTwo &&
            isAcceptedWithFunding && (
              <div className="ProposalCampaignBlock-with-funding">
                Funded through &nbsp;
                <ZFGrantsLogo style={{ height: '1.5rem' }} />
              </div>
            )}

          {isVersionTwo &&
            !isAcceptedWithFunding && (
              <div className="ProposalCampaignBlock-without-funding">
                Open for Community Donations
              </div>
            )}

          {!isVersionTwo &&
            proposal.contributionMatching > 0 && (
              <div className="ProposalCampaignBlock-matching">
                <span>Funds are being matched x{proposal.contributionMatching + 1}</span>
                <Popover
                  overlayClassName="ProposalCampaignBlock-popover-overlay"
                  placement="left"
                  content={
                    <>
                      <b>Matching</b>
                      <br />
                      Increase your impact! Contributions to this proposal are being
                      matched by the Zcash Foundation, up to the target amount.
                    </>
                  }
                >
                  <Icon type="question-circle" theme="filled" />
                </Popover>
              </div>
            )}

          {!isVersionTwo &&
            (isFundingOver ? (
              <div
                className={classnames({
                  ['ProposalCampaignBlock-fundingOver']: true,
                  ['is-success']: isRaiseGoalReached,
                })}
              >
                {isCanceled ? (
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
              </>
            ))}

          {isVersionTwo &&
            isCanceled && (
              <div className="ProposalCampaignBlock-fundingOver">
                <Icon type="close-circle-o" />
                <span>Proposal was canceled</span>
              </div>
            )}
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
}

function mapStateToProps(state: AppState) {
  return {
    authUser: state.auth.user,
  };
}

const withConnect = connect(mapStateToProps);

const ConnectedProposalCampaignBlock = compose<Props, OwnProps>(
  withRouter,
  withConnect,
)(ProposalCampaignBlock);

export default ConnectedProposalCampaignBlock;
