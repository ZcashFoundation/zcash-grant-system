import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Tag, Popconfirm, Tooltip } from 'antd';
import UnitDisplay from 'components/UnitDisplay';
import { ONE_DAY } from 'utils/time';
import { formatTxExplorerUrl } from 'utils/formatters';
import { deleteContribution } from 'modules/users/actions';
import { UserContribution } from 'types';
import './ProfileContribution.less';
import { PROPOSAL_STAGE } from 'api/constants';

interface OwnProps {
  userId: number;
  contribution: UserContribution;
  showSendInstructions(contribution: UserContribution): void;
}

interface DispatchProps {
  deleteContribution: typeof deleteContribution;
}

type Props = OwnProps & DispatchProps;

class ProfileContribution extends React.Component<Props> {
  render() {
    const { contribution } = this.props;
    const { proposal, private: isPrivate } = contribution;
    const isConfirmed = contribution.status === 'CONFIRMED';
    const isExpired =
      (!isConfirmed && contribution.dateCreated < Date.now() / 1000 - ONE_DAY) ||
      (proposal.stage === PROPOSAL_STAGE.CANCELED ||
        proposal.stage === PROPOSAL_STAGE.FAILED);

    let tag;
    let actions: React.ReactNode;
    if (isConfirmed) {
      actions = (
        <a
          href={formatTxExplorerUrl(contribution.txId as string)}
          target="_blank"
          rel="noopener nofollow"
        >
          View transaction
        </a>
      );
    } else if (isExpired) {
      tag = <Tag color="red">Expired</Tag>;
      actions = (
        <>
          <Popconfirm title="Are you sure?" onConfirm={this.deleteContribution}>
            <a>Delete</a>
          </Popconfirm>
          <Link to="/contact">Contact support</Link>
        </>
      );
    } else {
      tag = <Tag color="orange">Pending</Tag>;
      actions = (
        <a onClick={() => this.props.showSendInstructions(contribution)}>
          View send instructions
        </a>
      );
    }

    const privateTag = isPrivate ? (
      <Tooltip
        title={
          <>
            Other users will <b>not</b> be able to see that you made this contribution.
          </>
        }
      >
        <Tag>Private</Tag>
      </Tooltip>
    ) : null;

    return (
      <div className="ProfileContribution">
        <div className="ProfileContribution-info">
          <Link
            className="ProfileContribution-info-title"
            to={`/proposals/${proposal.proposalId}`}
          >
            {proposal.title} {privateTag}
            {tag}
          </Link>
          <div className="ProfileContribution-info-brief">{proposal.brief}</div>
        </div>
        <div className="ProfileContribution-state">
          <div className="ProfileContribution-state-amount">
            +<UnitDisplay value={contribution.amount} symbol="ZEC" />
          </div>
          <div className="ProfileContribution-state-actions">{actions}</div>
        </div>
      </div>
    );
  }

  private deleteContribution = () => {
    this.props.deleteContribution(this.props.userId, this.props.contribution.id);
  };
}

export default connect<{}, DispatchProps, OwnProps, {}>(
  undefined,
  {
    deleteContribution,
  },
)(ProfileContribution);
