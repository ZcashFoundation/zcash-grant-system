import React, { ReactNode } from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Markdown from 'components/Markdown';
import LinkableTabs from 'components/LinkableTabs';
import Loader from 'components/Loader';
import { proposalActions } from 'modules/proposals';
import { bindActionCreators, Dispatch } from 'redux';
import { AppState } from 'store/reducers';
import { STATUS } from 'types';
import { Tabs, Icon, Dropdown, Menu, Button, Alert } from 'antd';
import { AlertProps } from 'antd/lib/alert';
import ExceptionPage from 'components/ExceptionPage';
import HeaderDetails from 'components/HeaderDetails';
import CampaignBlock from './CampaignBlock';
import TippingBlock from './TippingBlock';
import TeamBlock from './TeamBlock';
import RFPBlock from './RFPBlock';
import Milestones from './Milestones';
import CommentsTab from './Comments';
import UpdatesTab from './Updates';
import ContributorsTab from './Contributors';
import UpdateModal from './UpdateModal';
import CancelModal from './CancelModal';
import classnames from 'classnames';
import { withRouter } from 'react-router';
import SocialShare from 'components/SocialShare';
import Follow from 'components/Follow';
import Like from 'components/Like';
import { TipJarProposalSettingsModal } from 'components/TipJar';
import './index.less';

interface OwnProps {
  proposalId: number;
  isPreview?: boolean;
}

interface StateProps {
  detail: AppState['proposal']['detail'];
  isFetchingDetail: AppState['proposal']['isFetchingDetail'];
  detailError: AppState['proposal']['detailError'];
  user: AppState['auth']['user'];
}

interface DispatchProps {
  fetchProposal: proposalActions.TFetchProposal;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  isBodyExpanded: boolean;
  isBodyOverflowing: boolean;
  isUpdateOpen: boolean;
  isCancelOpen: boolean;
  isTipJarOpen: boolean;
}

export class ProposalDetail extends React.Component<Props, State> {
  state: State = {
    isBodyExpanded: false,
    isBodyOverflowing: false,
    isUpdateOpen: false,
    isCancelOpen: false,
    isTipJarOpen: false,
  };

  bodyEl: HTMLElement | null = null;

  componentDidMount() {
    // always refresh from server
    this.props.fetchProposal(this.props.proposalId);

    if (this.props.detail) {
      this.checkBodyOverflow();
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.checkBodyOverflow);
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.checkBodyOverflow);
    }
  }

  componentDidUpdate() {
    if (this.props.detail) {
      this.checkBodyOverflow();
    }
  }

  render() {
    const { user, detail: proposal, isPreview, detailError } = this.props;
    const {
      isBodyExpanded,
      isBodyOverflowing,
      isCancelOpen,
      isUpdateOpen,
      isTipJarOpen,
    } = this.state;
    const showExpand = !isBodyExpanded && isBodyOverflowing;
    const wrongProposal = proposal && proposal.proposalId !== this.props.proposalId;

    if (detailError) {
      return <ExceptionPage code="404" desc="Could not find that proposal" />;
    }
    if (!proposal || wrongProposal) {
      return <Loader size="large" />;
    }

    const isTrustee = !!proposal.team.find(tm => tm.userid === (user && user.userid));
    const isLive = proposal.status === STATUS.LIVE;
    const milestonesDisabled = proposal.isVersionTwo
        ? !proposal.acceptedWithFunding
        : false;
    const defaultTab = !milestonesDisabled || !isLive ? 'milestones' : 'discussions';

    const adminMenu = (
      <Menu>
        <Menu.Item disabled={!isLive} onClick={this.openTipJarModal}>
          Manage Tipping
        </Menu.Item>
        <Menu.Item disabled={!isLive} onClick={this.openUpdateModal}>
          Post an Update
        </Menu.Item>
        <Menu.Item disabled={!isLive} onClick={this.openCancelModal}>
          Cancel proposal
        </Menu.Item>
      </Menu>
    );

    // BANNER
    const statusBanner = {
      [STATUS.PENDING]: {
        blurb: (
          <>
            Your proposal is being reviewed and is only visible to the team. You will get
            an email when it is complete.
          </>
        ),
        type: 'warning',
      },
      [STATUS.APPROVED]: {
        blurb: (
          <>
            Your proposal has been approved! It is currently only visible to the team.
            Visit your <Link to="/profile?tab=pending">profile's pending tab</Link> to
            publish.
          </>
        ),
        type: 'success',
      },
      [STATUS.REJECTED]: {
        blurb: (
          <>
            Your proposal has changes requested and is only visible to the team. Visit
            your <Link to="/profile?tab=pending">profile's pending tab</Link> for more
            information.
          </>
        ),
        type: 'error',
      },
      [STATUS.STAKING]: {
        blurb: (
          <>
            Your proposal is awaiting a staking contribution. Visit your{' '}
            <Link to="/profile?tab=pending">profile's pending tab</Link> for more
            information.
          </>
        ),
        type: 'warning',
      },
    } as { [key in STATUS]: { blurb: ReactNode; type: AlertProps['type'] } };
    let banner = statusBanner[proposal.status];
    if (isPreview) {
      banner = {
        blurb: 'This is a preview of your proposal. It has not yet been published.',
        type: 'info',
      };
    }

    return (
      <div className="Proposal">
        <HeaderDetails title={proposal.title} description={proposal.brief} />
        {banner && (
          <div className="Proposal-banner">
            <Alert type={banner.type} message={banner.blurb} showIcon={false} banner />
          </div>
        )}
        <div className="Proposal-top">
          {isLive && (
            <div className="Proposal-top-social">
              <SocialShare
                url={(typeof window !== 'undefined' && window.location.href) || ''}
                title={`${proposal.title} needs funding on Grant-io!`}
                text={`${
                  proposal.title
                } needs funding on ZF Grants! Come help make this proposal a reality by funding it.`}
              />
            </div>
          )}
          <div className="Proposal-top-main">
            <div className="Proposal-top-main-title">
              <h1>{proposal ? proposal.title : <span>&nbsp;</span>}</h1>
              {isLive && (
                <div className="Proposal-top-main-title-menu">
                  {isTrustee && (
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
                  )}
                  <Like
                    proposal={proposal}
                    className="Proposal-top-main-title-menu-item"
                  />
                  <Follow
                    proposal={proposal}
                    className="Proposal-top-main-title-menu-item"
                  />
                </div>
              )}
            </div>

            <div className="Proposal-top-main-block" style={{ flexGrow: 1 }}>
              <div
                ref={el => (this.bodyEl = el)}
                className={classnames({
                  ['Proposal-top-main-block-bodyText']: true,
                  ['is-expanded']: isBodyExpanded,
                })}
              >
                {proposal ? <Markdown source={proposal.content} /> : <Loader />}
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
          </div>
          <div className="Proposal-top-side">
            <TippingBlock proposal={proposal} />
            <CampaignBlock proposal={proposal} isPreview={!isLive} />
            <TeamBlock proposal={proposal} />
            {proposal.rfp && <RFPBlock rfp={proposal.rfp} />}
          </div>
        </div>

        <div className="Proposal-bottom">
          <LinkableTabs scrollToTabs defaultActiveKey={defaultTab}>
            <Tabs.TabPane tab="Milestones" key="milestones">
              <div style={{ marginTop: '1.5rem', padding: '0 2rem' }}>
                <Milestones proposal={proposal} />
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Discussion" key="discussions" disabled={!isLive}>
              <CommentsTab proposalId={proposal.proposalId} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Updates" key="updates" disabled={!isLive}>
              <UpdatesTab proposalId={proposal.proposalId} />
            </Tabs.TabPane>
            {!proposal.isVersionTwo && (
              <Tabs.TabPane tab="Contributors" key="contributors" disabled={!isLive}>
                <ContributorsTab proposalId={proposal.proposalId} />
              </Tabs.TabPane>
            )}
          </LinkableTabs>
        </div>

        {isTrustee && (
          <>
            <UpdateModal
              proposalId={proposal.proposalId}
              isVisible={isUpdateOpen}
              handleClose={this.closeUpdateModal}
            />
            <CancelModal
              proposal={proposal}
              isVisible={isCancelOpen}
              handleClose={this.closeCancelModal}
            />
            <TipJarProposalSettingsModal
              proposal={proposal}
              isVisible={isTipJarOpen}
              handleClose={this.closeTipJarModal}
            />
          </>
        )}
      </div>
    );
  }

  private expandBody = () => {
    this.setState({ isBodyExpanded: true });
  };

  private checkBodyOverflow = () => {
    const { isBodyExpanded, isBodyOverflowing } = this.state;
    if (isBodyExpanded || !this.bodyEl) {
      return;
    }

    if (isBodyOverflowing && this.bodyEl.scrollHeight <= this.bodyEl.clientHeight) {
      this.setState({ isBodyOverflowing: false });
    } else if (
      !isBodyOverflowing &&
      this.bodyEl.scrollHeight > this.bodyEl.clientHeight
    ) {
      this.setState({ isBodyOverflowing: true });
    }
  };

  private openTipJarModal = () => this.setState({ isTipJarOpen: true });
  private closeTipJarModal = () => this.setState({ isTipJarOpen: false });

  private openUpdateModal = () => this.setState({ isUpdateOpen: true });
  private closeUpdateModal = () => this.setState({ isUpdateOpen: false });

  private openCancelModal = () => this.setState({ isCancelOpen: true });
  private closeCancelModal = () => this.setState({ isCancelOpen: false });
}

function mapStateToProps(state: AppState, _: OwnProps) {
  return {
    detail: state.proposal.detail,
    isFetchingDetail: state.proposal.isFetchingDetail,
    detailError: state.proposal.detailError,
    user: state.auth.user,
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators({ ...proposalActions }, dispatch);
}

const withConnect = connect<StateProps, DispatchProps, OwnProps, AppState>(
  mapStateToProps,
  mapDispatchToProps,
);

const ConnectedProposal = compose<Props, OwnProps>(
  withRouter,
  withConnect,
)(ProposalDetail);

export default ConnectedProposal;
