import React from 'react';
import { debounce } from 'lodash';
import { connect } from 'react-redux';
import { proposalActions } from 'modules/proposals';
import { bindActionCreators, Dispatch } from 'redux';
import { AppState } from 'store/reducers';
import { Input, Divider, Drawer, Icon, Button } from 'antd';
import ProposalResults from './Results';
import ProposalFilters from './Filters';
import { PROPOSAL_SORT } from 'api/constants';
import ZCFLogo from 'static/images/zcf.svg';
import './style.less';

interface StateProps {
  page: AppState['proposal']['page'];
}

interface DispatchProps {
  fetchProposals: typeof proposalActions['fetchProposals'];
  setProposalPage: typeof proposalActions['setProposalPage'];
}

type Props = StateProps & DispatchProps;

interface State {
  isFiltersDrawered: boolean;
  isDrawerShowing: boolean;
  searchQuery: string;
}

class Proposals extends React.Component<Props, State> {
  state: State = {
    isFiltersDrawered: false,
    isDrawerShowing: false,
    // partially controlled search - set it at construction from store
    searchQuery: this.props.page.search,
  };

  private setSearch = debounce(search => this.props.setProposalPage({ search }), 1000);

  componentDidMount() {
    this.props.fetchProposals();
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  render() {
    const { isFiltersDrawered, isDrawerShowing } = this.state;
    const { filters, sort } = this.props.page;
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
        <div className="Proposals-content">
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
            <div className="Proposals-filters">
              <div className="Proposals-search">
                <Input.Search
                  placeholder="Search for a proposal"
                  onChange={this.handleChangeSearch}
                  value={this.state.searchQuery}
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
              {filtersComponent}
            </div>
          )}

          <div className="Proposals-results">
            <div className="Proposals-about">
              <div className="Proposals-about-logo">
                <ZCFLogo />
              </div>
              <div className="Proposals-about-text">
                <h2 className="Proposals-about-text-title">Zcash Foundation Proposals</h2>
                <p className="Proposals-about-text-desc">
                  The Zcash Foundation accepts proposals from community members to improve
                  the Zcash ecosystem. Proposals are either funded by the Zcash Foundation
                  directly, or are opened for community donations should they be approved
                  by the Zcash Foundation."
                </p>
              </div>
            </div>

            <Divider />
            <ProposalResults
              page={this.props.page}
              onPageChange={this.handlePageChange}
            />
          </div>
        </div>
      </div>
    );
  }

  private handleChangeSearch = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = ev.currentTarget.value;
    this.setState({ searchQuery });
    // debounced call to setProposalPage
    this.setSearch(searchQuery);
  };

  private handleChangeSort = (sort: PROPOSAL_SORT) => {
    this.props.setProposalPage({ sort });
  };

  private handleChangeFilters = (filters: StateProps['page']['filters']) => {
    this.props.setProposalPage({ filters });
  };

  private handlePageChange = (page: number) => {
    this.props.setProposalPage({ page });
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
    page: state.proposal.page,
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(proposalActions, dispatch);
}

const ConnectedProposals = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Proposals);

export default ConnectedProposals;
