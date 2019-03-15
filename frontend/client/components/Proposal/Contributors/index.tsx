import React from 'react';
import { connect } from 'react-redux';
import UserRow from 'components/UserRow';
import Placeholder from 'components/Placeholder';
import UnitDisplay from 'components/UnitDisplay';
import { toZat } from 'utils/units';
import { fetchProposalContributions } from 'modules/proposals/actions';
import {
  getProposalContributions,
  getIsFetchingContributions,
  getFetchContributionsError,
} from 'modules/proposals/selectors';
import { ContributionWithUser } from 'types';
import { AppState } from 'store/reducers';
import './index.less';

interface OwnProps {
  proposalId: number;
}

interface StateProps {
  contributions: ReturnType<typeof getProposalContributions>;
  isFetchingContributions: ReturnType<typeof getIsFetchingContributions>;
  fetchContributionsError: ReturnType<typeof getFetchContributionsError>;
}

interface DispatchProps {
  fetchProposalContributions: typeof fetchProposalContributions;
}

type Props = OwnProps & StateProps & DispatchProps;

class ProposalContributors extends React.Component<Props> {
  componentDidMount() {
    if (this.props.proposalId) {
      this.props.fetchProposalContributions(this.props.proposalId);
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.proposalId && nextProps.proposalId !== this.props.proposalId) {
      this.props.fetchProposalContributions(nextProps.proposalId);
    }
  }

  render() {
    const { contributions, fetchContributionsError } = this.props;

    let content;
    if (contributions) {
      if (contributions.top.length && contributions.latest.length) {
        const makeContributionRow = (c: ContributionWithUser) => (
          <div className="ProposalContributors-block-contributor" key={c.id}>
            <UserRow
              user={c.user}
              extra={
                <>
                  +<UnitDisplay value={toZat(c.amount)} symbol="ZEC" />
                </>
              }
            />
          </div>
        );
        content = (
          <>
            <div className="ProposalContributors-block">
              <h3 className="ProposalContributors-block-title">Latest contributors</h3>
              {contributions.latest.map(makeContributionRow)}
            </div>
            <div className="ProposalContributors-block">
              <h3 className="ProposalContributors-block-title">Top contributors</h3>
              {contributions.top.map(makeContributionRow)}
            </div>
          </>
        );
      } else {
        content = (
          <Placeholder
            style={{ minHeight: '220px' }}
            title="No contributors found"
            subtitle={`
              No contributions have been made to this proposal.
              Check back later once there's been at least one contribution.
            `}
          />
        );
      }
    } else if (fetchContributionsError) {
      content = (
        <Placeholder title="Something went wrong" subtitle={fetchContributionsError} />
      );
    } else {
      content = <Placeholder loading={true} />;
    }

    return <div className="ProposalContributors">{content}</div>;
  }
}

export default connect(
  (state: AppState, ownProps: OwnProps) => ({
    contributions: getProposalContributions(state, ownProps.proposalId),
    isFetchingContributions: getIsFetchingContributions(state),
    fetchContributionsError: getFetchContributionsError(state),
  }),
  {
    fetchProposalContributions,
  },
)(ProposalContributors);
