import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Tag, Popconfirm } from 'antd';
import UnitDisplay from 'components/UnitDisplay';
import { ONE_DAY } from 'utils/time';
import { formatTxExplorerUrl } from 'utils/formatters';
import { deleteContribution } from 'modules/users/actions';
import { UserContribution } from 'types';
import './ProfileContribution.less';

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
    const { proposal } = contribution;
    const isConfirmed = contribution.status === 'CONFIRMED';
    const isExpired = !isConfirmed && contribution.dateCreated < Date.now() / 1000 - ONE_DAY;

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
      // TODO: Link to support
      actions = <>
        <Popconfirm
          title="Are you sure?"
          onConfirm={this.deleteContribution}
        >
          <a>Delete</a>
        </Popconfirm>
        <Link to="/support">Contact support</Link>
      </>;
    } else {
      tag = <Tag color="orange">Pending</Tag>;
      actions = (
        <a onClick={() => this.props.showSendInstructions(contribution)}>
          View send instructions
        </a>
      );
    }

    return (
      <div className="ProfileContribution">
        <div className="ProfileContribution-info">
          <Link
            className="ProfileContribution-info-title"
            to={`/proposals/${proposal.proposalId}`}
          >
            {proposal.title} {tag}
          </Link>
          <div className="ProfileContribution-info-brief">{proposal.brief}</div>
        </div>
        <div className="ProfileContribution-state">
          <div className="ProfileContribution-state-amount">
            +<UnitDisplay value={contribution.amount} symbol="ZEC" />
          </div>
          <div className="ProfileContribution-state-actions">
            {actions}
          </div>
        </div>
      </div>
    );
  }

  private deleteContribution = () => {
    this.props.deleteContribution(this.props.userId, this.props.contribution.id);
  };
}

export default connect<{}, DispatchProps, OwnProps, {}>(undefined, {
  deleteContribution,
})(ProfileContribution);
