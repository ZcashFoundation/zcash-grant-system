import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import Markdown from 'components/Markdown';
import { proposalActions } from 'modules/proposals';
import { bindActionCreators, Dispatch } from 'redux';
import { AppState } from 'store/reducers';
import { Proposal } from 'types';
import { getProposal } from 'modules/proposals/selectors';
import { Spin, Tabs, Icon, Dropdown, Menu, Button } from 'antd';
import CampaignBlock from './CampaignBlock';
import TeamBlock from './TeamBlock';
import Milestones from './Milestones';
import CommentsTab from './Comments';
import UpdatesTab from './Updates';
import ContributorsTab from './Contributors';
// import CommunityTab from './Community';
import UpdateModal from './UpdateModal';
import CancelModal from './CancelModal';
import classnames from 'classnames';
import { withRouter } from 'react-router';
import SocialShare from 'components/SocialShare';
import './style.less';

interface OwnProps {
  proposalId: number;
  isPreview?: boolean;
}

interface StateProps {
  proposal: Proposal | null;
  account: string | null;
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
  bodyId: string;
}

export class ProposalDetail extends React.Component<Props, State> {
  state: State = {
    isBodyExpanded: false,
    isBodyOverflowing: false,
    isUpdateOpen: false,
    isCancelOpen: false,
    bodyId: `body-${Math.floor(Math.random() * 1000000)}`,
  };

  componentDidMount() {
    if (!this.props.proposal) {
      this.props.fetchProposal(this.props.proposalId);
    } else {
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
    if (this.props.proposal) {
      this.checkBodyOverflow();
    }
  }

  render() {
    const { proposal, isPreview } = this.props;
    const {
      isBodyExpanded,
      isBodyOverflowing,
      isCancelOpen,
      isUpdateOpen,
      bodyId,
    } = this.state;
    const showExpand = !isBodyExpanded && isBodyOverflowing;

    if (!proposal) {
      return <Spin />;
    } else {
      const deadline = 0; // TODO: Use actual date for deadline
      const isTrustee = false; // TODO: determine rework to isAdmin
      const hasBeenFunded = false; // TODO: deterimne if proposal has reached funding
      const isProposalActive = !hasBeenFunded && deadline > Date.now();
      const canCancel = false; // TODO: Allow canceling if proposal hasn't gone live yet

      const adminMenu = isTrustee && (
        <Menu>
          <Menu.Item onClick={this.openUpdateModal}>Post an Update</Menu.Item>
          <Menu.Item
            onClick={() => alert('Sorry, not yet implemented!')}
            disabled={!isProposalActive}
          >
            Edit proposal
          </Menu.Item>
          <Menu.Item
            style={{ color: canCancel ? '#e74c3c' : undefined }}
            onClick={this.openCancelModal}
            disabled={!canCancel}
          >
            Cancel proposal
          </Menu.Item>
        </Menu>
      );

      return (
        <div className="Proposal">
          <div className="Proposal-top">
            <div className="Proposal-top-social">
              <SocialShare
                url={(typeof window !== 'undefined' && window.location.href) || ''}
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
                  {proposal ? (
                    <Markdown source={proposal.content} />
                  ) : (
                    <Spin size="large" />
                  )}
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
                <UpdatesTab proposalId={proposal.proposalId} />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Contributors" key="contributors">
                <ContributorsTab />
              </Tabs.TabPane>
            </Tabs>
          )}
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
            </>
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

  private openUpdateModal = () => this.setState({ isUpdateOpen: true });
  private closeUpdateModal = () => this.setState({ isUpdateOpen: false });

  private openCancelModal = () => this.setState({ isCancelOpen: true });
  private closeCancelModal = () => this.setState({ isCancelOpen: false });
}

function mapStateToProps(state: AppState, ownProps: OwnProps) {
  console.warn('TODO - new redux user-proposal-role/account');
  return {
    proposal: getProposal(state, ownProps.proposalId),
    account: 'notarealaccount' || null,
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
