import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { proposalActions } from 'modules/proposals';
import { getProposals } from 'modules/proposals/selectors';
import { ProposalWithCrowdFund } from 'types';
import { bindActionCreators, Dispatch } from 'redux';
import { AppState } from 'store/reducers';
import { Input, Divider, Spin, Drawer, Icon, Button } from 'antd';
import ProposalResults from './Results';
import ProposalFilters, { Filters } from './Filters';
import { PROPOSAL_SORT } from 'api/constants';
import Web3Container from 'lib/Web3Container';
import './style.less';

type ProposalSortFn = (p1: ProposalWithCrowdFund, p2: ProposalWithCrowdFund) => number;
const sortFunctions: { [key in PROPOSAL_SORT]: ProposalSortFn } = {
  [PROPOSAL_SORT.NEWEST]: (p1, p2) => p2.dateCreated - p1.dateCreated,
  [PROPOSAL_SORT.OLDEST]: (p1, p2) => p1.dateCreated - p2.dateCreated,
  [PROPOSAL_SORT.LEAST_FUNDED]: (p1, p2) => {
    // First show sub-100% funding
    const p1Pct = p1.crowdFund.percentFunded;
    const p2Pct = p2.crowdFund.percentFunded;
    if (p1Pct < 1 && p2Pct >= 1) {
      return -1;
    } else if (p2Pct < 1 && p1Pct >= 1) {
      return 1;
    } else if (p1Pct < 1 && p2Pct < 1) {
      return p1Pct - p2Pct;
    }
    // Then show most overall funds
    return p1.crowdFund.funded.cmp(p2.crowdFund.funded);
  },
  [PROPOSAL_SORT.MOST_FUNDED]: (p1, p2) => {
    // First show sub-100% funding
    const p1Pct = p1.crowdFund.percentFunded;
    const p2Pct = p2.crowdFund.percentFunded;
    if (p1Pct < 1 && p2Pct >= 1) {
      return 1;
    } else if (p2Pct < 1 && p1Pct >= 1) {
      return -1;
    } else if (p1Pct < 1 && p2Pct < 1) {
      return p2Pct - p1Pct;
    }
    // Then show most overall funds
    return p2.crowdFund.funded.cmp(p1.crowdFund.funded);
  },
};

interface StateProps {
  proposals: ReturnType<typeof getProposals>;
  proposalsError: AppState['proposal']['proposalsError'];
  isFetchingProposals: AppState['proposal']['isFetchingProposals'];
}

interface DispatchProps {
  fetchProposals: proposalActions.TFetchProposals;
}

type Props = StateProps & DispatchProps;

interface State {
  processedProposals: ProposalWithCrowdFund[];
  searchQuery: string;
  sort: PROPOSAL_SORT;
  filters: Filters;
  isFiltersDrawered: boolean;
  isDrawerShowing: boolean;
}

class Proposals extends React.Component<Props, State> {
  static getDerivedStateFromProps(props: Props, state: State) {
    return {
      ...state,
      processedProposals: Proposals.processProposals(props.proposals, state),
    };
  }

  // TODO: Move me server side / redux
  static processProposals(proposals: ProposalWithCrowdFund[], state: State) {
    let processedProposals = [...proposals];

    // Categories
    if (state.filters.categories.length) {
      processedProposals = processedProposals.filter(p =>
        state.filters.categories.includes(p.category),
      );
    }
    // Stages
    if (state.filters.stage) {
      processedProposals = processedProposals.filter(
        p => p.stage === state.filters.stage,
      );
    }
    // Search text
    if (state.searchQuery) {
      processedProposals = processedProposals.filter(p =>
        p.title.toLowerCase().includes(state.searchQuery.toLowerCase()),
      );
    }

    // Sort
    if (state.sort) {
      processedProposals = processedProposals.sort(sortFunctions[state.sort]);
    }

    return processedProposals;
  }

  state: State = {
    processedProposals: [],
    searchQuery: '',
    sort: PROPOSAL_SORT.NEWEST,
    filters: {
      categories: [],
      stage: null,
    },
    isFiltersDrawered: false,
    isDrawerShowing: false,
  };

  componentDidMount() {
    this.props.fetchProposals();
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  render() {
    const { proposalsError, isFetchingProposals } = this.props;
    const {
      processedProposals,
      sort,
      filters,
      isFiltersDrawered,
      isDrawerShowing,
    } = this.state;
    const filtersComponent = (
      <ProposalFilters
        sort={sort}
        filters={filters}
        handleChangeSort={this.handleChangeSort}
        handleChangeFilters={this.handleChangeFilters}
      />
    );
    return (
      <div className="Proposals">
        {isFiltersDrawered ? (
          <Drawer
            placement="right"
            visible={isDrawerShowing}
            onClose={this.closeFilterDrawer}
            closable={false}
            width={300}
          >
            {filtersComponent}
            <Button
              type="primary"
              onClick={this.closeFilterDrawer}
              style={{ marginTop: '1rem' }}
              block
            >
              Done
            </Button>
          </Drawer>
        ) : (
          <div className="Proposals-filters">{filtersComponent}</div>
        )}

        <div className="Proposals-results">
          <div className="Proposals-search">
            <Input.Search
              placeholder="Search for a proposal"
              onChange={this.handleChangeSearch}
              size="large"
            />
            <Button
              className="Proposals-search-filterButton"
              type="primary"
              size="large"
              onClick={this.openFilterDrawer}
            >
              <Icon type="filter" /> Filters
            </Button>
          </div>
          <Divider />
          <ProposalResults
            proposals={processedProposals}
            proposalsError={proposalsError}
            isFetchingProposals={isFetchingProposals}
          />
        </div>
      </div>
    );
  }

  // TODO: Move me to redux action for server request
  private handleChangeSearch = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchQuery: ev.currentTarget.value });
  };

  // TODO: Move me to redux action for server request
  private handleChangeSort = (sort: PROPOSAL_SORT) => {
    this.setState({ sort });
  };

  // TODO: Move me to redux action for server request
  private handleChangeFilters = (filters: Filters) => {
    this.setState({ filters });
  };

  private handleResize = () => {
    if (this.state.isFiltersDrawered && window.innerWidth > 640) {
      this.setState({
        isFiltersDrawered: false,
        isDrawerShowing: false,
      });
    } else if (!this.state.isFiltersDrawered && window.innerWidth <= 640) {
      this.setState({
        isFiltersDrawered: true,
        isDrawerShowing: false,
      });
    }
  };

  private openFilterDrawer = () => this.setState({ isDrawerShowing: true });
  private closeFilterDrawer = () => this.setState({ isDrawerShowing: false });
}

function mapStateToProps(state: AppState) {
  return {
    proposals: getProposals(state),
    proposalsError: state.proposal.proposalsError,
    isFetchingProposals: state.proposal.isFetchingProposals,
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(proposalActions, dispatch);
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const ConnectedProposals = compose(withConnect)(Proposals);

export default () => (
  <Web3Container renderLoading={() => <Spin />} render={() => <ConnectedProposals />} />
);
