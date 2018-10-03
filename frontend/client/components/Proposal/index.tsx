import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import Markdown from 'components/Markdown';
import { proposalActions } from 'modules/proposals';
import { bindActionCreators, Dispatch } from 'redux';
import { AppState } from 'store/reducers';
import { ProposalWithCrowdFund } from 'modules/proposals/reducers';
import { getProposal } from 'modules/proposals/selectors';
import { Spin, Tabs, Icon, Dropdown, Menu, Button } from 'antd';
import CampaignBlock from './CampaignBlock';
import TeamBlock from './TeamBlock';
import Milestones from './Milestones';
import CommentsTab from './Comments';
import UpdatesTab from './Updates';
import GovernanceTab from './Governance';
import ContributorsTab from './Contributors';
// import CommunityTab from './Community';
import CancelModal from './CancelModal';
import './style.less';
import classnames from 'classnames';
import { withRouter } from 'react-router';
import Web3Container from 'lib/Web3Container';
import { web3Actions } from 'modules/web3';
import SocialShare from 'components/SocialShare';

interface OwnProps {
  proposalId: string;
  isPreview?: boolean;
}

interface StateProps {
  proposal: ProposalWithCrowdFund;
}

interface DispatchProps {
  fetchProposal: proposalActions.TFetchProposal;
}

interface Web3Props {
  account: string;
}

type Props = StateProps & DispatchProps & Web3Props & OwnProps;

interface State {
  isBodyExpanded: boolean;
  isBodyOverflowing: boolean;
  isCancelOpen: boolean;
  bodyId: string;
}

export class ProposalDetail extends React.Component<Props, State> {
  state: State = {
    isBodyExpanded: false,
    isBodyOverflowing: false,
    isCancelOpen: false,
    bodyId: `body-${Math.floor(Math.random() * 1000000)}`,
  };

  componentDidMount() {
    if (!this.props.proposal) {
      this.props.fetchProposal(this.props.proposalId);
    } else {
      this.checkBodyOverflow();
    }
    window.addEventListener('resize', this.checkBodyOverflow);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.checkBodyOverflow);
  }

  componentDidUpdate() {
    if (this.props.proposal) {
      this.checkBodyOverflow();
    }
  }

  render() {
    const { proposal, isPreview, account } = this.props;
    const { isBodyExpanded, isBodyOverflowing, isCancelOpen, bodyId } = this.state;
    const showExpand = !isBodyExpanded && isBodyOverflowing;

    if (!proposal) {
      return <Spin />;
    } else {
      const { crowdFund } = proposal;
      const isTrustee = crowdFund.trustees.includes(account);
      const isContributor = !!crowdFund.contributors.find(c => c.address === account);
      const hasBeenFunded = crowdFund.isRaiseGoalReached;
      const isProposalActive = !hasBeenFunded && crowdFund.deadline > Date.now();
      const canRefund = (hasBeenFunded || isProposalActive) && !crowdFund.isFrozen;

      const adminMenu = isTrustee && (
        <Menu>
          <Menu.Item
            onClick={() => alert('Sorry, not yet implemented!')}
            disabled={!isProposalActive}
          >
            Edit proposal
          </Menu.Item>
          <Menu.Item
            style={{ color: canRefund ? '#e74c3c' : undefined }}
            onClick={this.openCancelModal}
            disabled={!canRefund}
          >
            {hasBeenFunded ? 'Refund contributors' : 'Cancel proposal'}
          </Menu.Item>
        </Menu>
      );

      return (
        <div className="Proposal">
          <div className="Proposal-top">
            <div className="Proposal-top-social">
              <SocialShare
                url={window.location.href}
                title={`${proposal.title} needs funding on Grant-io!`}
                text={`${
                  proposal.title
                } needs funding on Grant.io! Come help make this proposal a reality by funding it.`}
              />
            </div>
            <div className="Proposal-top-main">
              <h1 className="Proposal-top-main-title">
                {proposal ? proposal.title : <span>&nbsp;</span>}
              </h1>
              <div className="Proposal-top-main-block" style={{ flexGrow: 1 }}>
                <div
                  id={bodyId}
                  className={classnames({
                    ['Proposal-top-main-block-bodyText']: true,
                    ['is-expanded']: isBodyExpanded,
                  })}
                >
                  {proposal ? <Markdown source={proposal.body} /> : <Spin size="large" />}
                </div>
                {showExpand && (
                  <button
                    className="Proposal-top-main-block-bodyExpand"
                    onClick={this.expandBody}
                  >
                    Read more <Icon type="arrow-down" style={{ fontSize: '0.7rem' }} />
                  </button>
                )}
              </div>
              {isTrustee && (
                <div className="Proposal-top-main-menu">
                  <Dropdown
                    overlay={adminMenu}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button>
                      <span>Actions</span>
                      <Icon type="down" style={{ marginRight: '-0.25rem' }} />
                    </Button>
                  </Dropdown>
                </div>
              )}
            </div>
            <div className="Proposal-top-side">
              <CampaignBlock proposal={proposal} isPreview={isPreview} />
              <TeamBlock proposal={proposal} />
            </div>
          </div>

          {proposal && (
            <Tabs>
              <Tabs.TabPane tab="Milestones" key="milestones">
                <div style={{ marginTop: '1.5rem', padding: '0 2rem' }}>
                  <Milestones proposal={proposal} />
                </div>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Discussion" key="discussions" disabled={isPreview}>
                <CommentsTab proposalId={proposal.proposalId} />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Updates" key="updates" disabled={isPreview}>
                <div style={{ marginTop: '1.5rem' }} />
                <UpdatesTab proposalId={proposal.proposalId} />
              </Tabs.TabPane>
              {isContributor && (
                <Tabs.TabPane tab="Refund" key="refund">
                  <GovernanceTab proposal={proposal} />
                </Tabs.TabPane>
              )}
              <Tabs.TabPane tab="Contributors" key="contributors">
                <ContributorsTab crowdFund={proposal.crowdFund} />
              </Tabs.TabPane>
            </Tabs>
          )}
          {isTrustee && (
            <CancelModal
              proposal={proposal}
              isVisible={isCancelOpen}
              handleClose={this.closeCancelModal}
            />
          )}
        </div>
      );
    }
  }

  private expandBody = () => {
    this.setState({ isBodyExpanded: true });
  };

  private checkBodyOverflow = () => {
    const { isBodyExpanded, bodyId, isBodyOverflowing } = this.state;
    if (isBodyExpanded) {
      return;
    }

    // Use id instead of ref because styled component ref doesn't return html element
    const bodyEl = document.getElementById(bodyId);
    if (!bodyEl) {
      return;
    }

    if (isBodyOverflowing && bodyEl.scrollHeight <= bodyEl.clientHeight) {
      this.setState({ isBodyOverflowing: false });
    } else if (!isBodyOverflowing && bodyEl.scrollHeight > bodyEl.clientHeight) {
      this.setState({ isBodyOverflowing: true });
    }
  };

  private openCancelModal = () => this.setState({ isCancelOpen: true });
  private closeCancelModal = () => this.setState({ isCancelOpen: false });
}

function mapStateToProps(state: AppState, ownProps: OwnProps) {
  return {
    proposal: getProposal(state, ownProps.proposalId),
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators({ ...proposalActions, ...web3Actions }, dispatch);
}

const withConnect = connect<StateProps, DispatchProps, OwnProps, AppState>(
  mapStateToProps,
  mapDispatchToProps,
);

const ConnectedProposal = compose<Props, OwnProps & Web3Props>(
  withRouter,
  withConnect,
)(ProposalDetail);

export default (props: OwnProps) => (
  <Web3Container
    renderLoading={() => (
      <div className="Proposal">
        <div className="Proposal-top">
          <div className="Proposal-top-main">
            <Spin />
          </div>
        </div>
      </div>
    )}
    render={({ accounts }) => <ConnectedProposal account={accounts[0]} {...props} />}
  />
);
