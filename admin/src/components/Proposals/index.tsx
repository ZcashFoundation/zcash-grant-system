import React from 'react';
import qs from 'query-string';
import { uniq, without } from 'lodash';
import { Link } from 'react-router-dom';
import { view } from 'react-easy-state';
import { Icon, Button, Dropdown, Menu, Tag, List } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import store from 'src/store';
import ProposalItem from './ProposalItem';
import { PROPOSAL_STATUS, Proposal } from 'src/types';
import STATUSES, { getStatusById } from './STATUSES';
import { ClickParam } from 'antd/lib/menu';
import './index.less';

interface Query {
  status: PROPOSAL_STATUS[];
}

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
        {STATUSES.map(f => (
          <Menu.Item key={f.id}>{f.filterDisplay}</Menu.Item>
        ))}
      </Menu>
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
        </div>
        {!!statusFilters.length && (
          <div className="Proposals-filters">
            Filters:{' '}
            {statusFilters.map(sf => (
              <Tag
                key={sf}
                onClose={() => this.handleFilterClose(sf)}
                color={getStatusById(sf).tagColor}
                closable
              >
                status: {sf}
              </Tag>
            ))}
            {statusFilters.length > 1 && (
              <Tag key="clear" onClick={this.handleFilterClear}>
                clear
              </Tag>
            )}
          </div>
        )}
        {proposalsFetching && 'Fetching proposals...'}
        {proposalsFetched &&
          !proposalsFetching && (
            <List
              className="Proposals-list"
              bordered
              dataSource={proposals}
              renderItem={(p: Proposal) => <ProposalItem key={p.proposalId} {...p} />}
            />
          )}
      </div>
    );
  }

  private fetchProposals = () => {
    const statusFilters = this.getParsedQuery().status;
    store.fetchProposals(statusFilters);
  };

  private getParsedQuery = () => {
    const parsed = qs.parse(this.props.history.location.search) as Query;
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

  private updateHistoryStateAndProposals = (queryStringArgs: Query) => {
    this.props.history.push(`${this.props.match.url}?${qs.stringify(queryStringArgs)}`);
    this.setStateFromQueryString();
    this.fetchProposals();
  };

  private addStatusFilter = (statusFilter: PROPOSAL_STATUS) => {
    const parsed = this.getParsedQuery();
    parsed.status = uniq([statusFilter, ...parsed.status]);
    this.updateHistoryStateAndProposals(parsed);
  };

  private removeStatusFilter = (statusFilter: PROPOSAL_STATUS) => {
    const parsed = this.getParsedQuery();
    parsed.status = without(parsed.status, statusFilter);
    this.updateHistoryStateAndProposals(parsed);
  };

  private clearStatusFilters = () => {
    const parsed = this.getParsedQuery();
    parsed.status = [];
    this.updateHistoryStateAndProposals(parsed);
  };

  private handleFilterClick = (e: ClickParam) => {
    this.addStatusFilter(e.key as PROPOSAL_STATUS);
  };

  private handleFilterClose = (filter: PROPOSAL_STATUS) => {
    this.removeStatusFilter(filter);
  };

  private handleFilterClear = () => {
    this.clearStatusFilters();
  };
}

const Proposals = withRouter(view(ProposalsNaked));
export default Proposals;
