import React from 'react';
import qs from 'query-string';
import { uniq, without } from 'lodash';
import { Link } from 'react-router-dom';
import { view } from 'react-easy-state';
import { Icon, Button, Dropdown, Menu, Tag } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import store from 'src/store';
import ProposalItem from './ProposalItem';
import './index.less';
import { PROPOSAL_STATUS } from 'src/types';
import { ClickParam } from 'antd/lib/menu';

const STATUS_FILTERS = [
  { id: PROPOSAL_STATUS.APPROVED, display: 'Status: approved' },
  { id: PROPOSAL_STATUS.DELETED, display: 'Status: deleted' },
  { id: PROPOSAL_STATUS.DRAFT, display: 'Status: draft' },
  { id: PROPOSAL_STATUS.LIVE, display: 'Status: live' },
  { id: PROPOSAL_STATUS.PENDING, display: 'Status: pending' },
  { id: PROPOSAL_STATUS.REJECTED, display: 'Status: rejected' },
];

type Props = RouteComponentProps<any>;

const STATE = {
  statusFilters: [] as PROPOSAL_STATUS[],
};

type State = typeof STATE;

class ProposalsNaked extends React.Component<Props, State> {
  state = STATE;
  componentDidMount() {
    this.setStateFromQueryString();
    this.fetchProposals();
  }

  render() {
    const id = Number(this.props.match.params.id);
    const { proposals, proposalsFetching, proposalsFetched } = store;
    const { statusFilters } = this.state;

    if (!proposalsFetched) {
      return 'loading proposals...';
    }

    if (id) {
      const singleProposal = proposals.find(p => p.proposalId === id);
      if (singleProposal) {
        return (
          <div className="Proposals">
            <div className="Proposals-controls">
              <Link to="/proposals">proposals</Link> <Icon type="right" /> {id}{' '}
              <Button
                title="refresh"
                icon="reload"
                onClick={() => store.fetchProposals()}
              />
            </div>
            <ProposalItem key={singleProposal.proposalId} {...singleProposal} />
          </div>
        );
      } else {
        return `could not find proposal: ${id}`;
      }
    }

    const statusFilterMenu = (
      <Menu onClick={this.handleFilterClick}>
        {STATUS_FILTERS.map(f => (
          <Menu.Item key={f.id}>{f.display}</Menu.Item>
        ))}
      </Menu>
    );

    const renderProposals = () => (
      <>
        {proposals.length === 0 && <div>no proposals</div>}
        {proposals.length > 0 &&
          proposals.map(p => <ProposalItem key={p.proposalId} {...p} />)}
      </>
    );

    return (
      <div className="Proposals">
        <div className="Proposals-controls">
          <Dropdown overlay={statusFilterMenu} trigger={['click']}>
            <Button>
              Filter <Icon type="down" />
            </Button>
          </Dropdown>
          <Button title="refresh" icon="reload" onClick={() => this.fetchProposals()} />
          <div className="Proposals-controls-filters">
            Filters: {!statusFilters.length && 'None'}
            {statusFilters.map(sf => (
              <Tag key={sf} onClose={() => this.handleFilterClose(sf)} closable>
                status: {sf}
              </Tag>
            ))}
          </div>
        </div>
        {proposalsFetching && 'Fetching proposals'}
        {proposalsFetched && !proposalsFetching && renderProposals()}
      </div>
    );
  }

  private fetchProposals = () => {
    const statusFilters = this.getParsedQuery().status;
    store.fetchProposals(statusFilters);
  };

  private getParsedQuery = () => {
    const parsed = qs.parse(this.props.history.location.search);
    let statusFilters = parsed.status || [];
    // qs.parse returns non-array for single item
    statusFilters = Array.isArray(statusFilters) ? statusFilters : [statusFilters];
    parsed.status = statusFilters;
    return parsed;
  };

  private setStateFromQueryString = () => {
    const statusFilters = this.getParsedQuery().status;
    this.setState({ statusFilters });
  };

  private addStatusFilter = (statusFilter: PROPOSAL_STATUS) => {
    const parsed = this.getParsedQuery();
    // update args
    parsed.status = uniq([statusFilter, ...parsed.status]);
    // push onto history
    this.props.history.push(`${this.props.match.url}?${qs.stringify(parsed)}`);
    // update state with new filter
    this.setStateFromQueryString();
    // fetch with new filters
    this.fetchProposals();
  };

  private removeStatusFilter = (statusFilter: PROPOSAL_STATUS) => {
    const parsed = this.getParsedQuery();
    // remove from array
    parsed.status = without(parsed.status, statusFilter);
    console.log(parsed.status, statusFilter);
    // push onto history
    this.props.history.push(`${this.props.match.url}?${qs.stringify(parsed)}`);
    // update state with new filter
    this.setStateFromQueryString();
    // fetch with new filters
    this.fetchProposals();
  };

  private handleFilterClick = (e: ClickParam) => {
    this.addStatusFilter(e.key as PROPOSAL_STATUS);
  };

  private handleFilterClose = (filter: PROPOSAL_STATUS) => {
    this.removeStatusFilter(filter);
  };
}

const Proposals = withRouter(view(ProposalsNaked));
export default Proposals;
