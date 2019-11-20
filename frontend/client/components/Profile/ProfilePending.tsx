import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button, Popconfirm, message, Tag } from 'antd';
import { UserProposal, STATUS, ContributionWithAddressesAndUser } from 'types';
import ContributionModal from 'components/ContributionModal';
import { getProposalStakingContribution } from 'api/api';
import { deletePendingProposal, publishPendingProposal } from 'modules/users/actions';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import './ProfilePending.less';

interface OwnProps {
  proposal: UserProposal;
  onPublish(id: UserProposal['proposalId']): void;
}

interface StateProps {
  user: AppState['auth']['user'];
}

interface DispatchProps {
  deletePendingProposal: typeof deletePendingProposal;
  publishPendingProposal: typeof publishPendingProposal;
}

type Props = OwnProps & StateProps & DispatchProps;

interface State {
  isDeleting: boolean;
  isPublishing: boolean;
  isLoadingStake: boolean;
  stakeContribution: ContributionWithAddressesAndUser | null;
}

class ProfilePending extends React.Component<Props, State> {
  state: State = {
    isDeleting: false,
    isPublishing: false,
    isLoadingStake: false,
    stakeContribution: null,
  };

  render() {
    const { status, title, proposalId, rejectReason } = this.props.proposal;
    const { isDeleting, isPublishing, isLoadingStake, stakeContribution } = this.state;

    const isDisableActions = isDeleting || isPublishing;

    const st = {
      [STATUS.APPROVED]: {
        color: 'green',
        tag: 'Approved',
        blurb: <div>You may publish this proposal when you are ready.</div>,
      },
      [STATUS.REJECTED]: {
        color: 'red',
        tag: 'Changes requested',
        blurb: (
          <>
            <div>This proposal has changes requested:</div>
            <q>{rejectReason}</q>
            <div>You may edit this proposal and re-submit it for approval.</div>
          </>
        ),
      },
      [STATUS.STAKING]: {
        color: 'purple',
        tag: 'Staking',
        blurb: (
          <div>
            Awaiting staking contribution, you will recieve an email when staking has been
            confirmed. If you staked this proposal you may check its status under the
            "funded" tab.
          </div>
        ),
      },
      [STATUS.PENDING]: {
        color: 'orange',
        tag: 'Pending',
        blurb: (
          <div>
            You will receive an email when this proposal has completed the review process.
          </div>
        ),
      },
    } as { [key in STATUS]: { color: string; tag: string; blurb: ReactNode } };

    return (
      <div className="ProfilePending">
        <div className="ProfilePending-block">
          <Link to={`/proposals/${proposalId}`} className="ProfilePending-title">
            {title} <Tag color={st[status].color}>{st[status].tag}</Tag>
          </Link>
          <div className={`ProfilePending-status is-${status.toLowerCase()}`}>
            {st[status].blurb}
          </div>
        </div>
        <div className="ProfilePending-block is-actions">
          {STATUS.APPROVED === status && (
            <Button
              loading={isPublishing}
              disabled={isDisableActions}
              type="primary"
              onClick={this.handlePublish}
            >
              Publish
            </Button>
          )}
          {STATUS.REJECTED === status && (
            <Link to={`/proposals/${proposalId}/edit`}>
              <Button disabled={isDisableActions} type="primary">
                Edit
              </Button>
            </Link>
          )}
          {STATUS.STAKING === status && (
            <Button
              type="primary"
              loading={isLoadingStake}
              onClick={this.openStakingModal}
            >
              Stake
            </Button>
          )}

          <Popconfirm
            key="delete"
            title="Are you sure?"
            onConfirm={() => this.handleDelete()}
          >
            <Button type="default" disabled={isDisableActions} loading={isDeleting}>
              Delete
            </Button>
          </Popconfirm>
        </div>

        {STATUS.STAKING && (
          <ContributionModal
            isVisible={!!stakeContribution}
            contribution={stakeContribution}
            handleClose={this.closeStakingModal}
            text={
              <p>
                For your proposal to be considered, please send a staking contribution of{' '}
                <b>{stakeContribution && stakeContribution.amount} ZEC</b> using the
                instructions below. Once your payment has been sent and received 6
                confirmations, you will receive an email.
              </p>
            }
          />
        )}
      </div>
    );
  }

  private handlePublish = async () => {
    const {
      user,
      proposal: { proposalId },
      onPublish,
    } = this.props;
    if (!user) return;
    this.setState({ isPublishing: true });
    try {
      await this.props.publishPendingProposal(user.userid, proposalId);
      onPublish(proposalId);
    } catch (e) {
      message.error(e.message || e.toString());
      this.setState({ isPublishing: false });
    }
  };

  private handleDelete = async () => {
    const {
      user,
      proposal: { proposalId },
    } = this.props;
    if (!user) return;
    this.setState({ isDeleting: true });
    try {
      await this.props.deletePendingProposal(user.userid, proposalId);
      message.success('Proposal deleted.');
    } catch (e) {
      message.error(e.message || e.toString());
      this.setState({ isDeleting: false });
    }
  };

  private openStakingModal = async () => {
    try {
      this.setState({ isLoadingStake: true });
      const res = await getProposalStakingContribution(this.props.proposal.proposalId);
      this.setState({ stakeContribution: res.data }, () => {
        this.setState({ isLoadingStake: false });
      });
    } catch (err) {
      console.error(err);
      message.error('Failed to get staking contribution, try again later', 3);
      this.setState({ isLoadingStake: false });
    }
  };

  private closeStakingModal = () =>
    this.setState({
      isLoadingStake: false,
      stakeContribution: null,
    });
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    user: state.auth.user,
  }),
  {
    deletePendingProposal,
    publishPendingProposal,
  },
)(ProfilePending);
