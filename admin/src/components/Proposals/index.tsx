import React from 'react';
import qs from 'query-string';
import { view } from 'react-easy-state';
import { Icon, Button, Dropdown, Menu, Tag, List, Input, Pagination } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import { RouteComponentProps, withRouter } from 'react-router';
import store from 'src/store';
import ProposalItem from './ProposalItem';
import { PROPOSAL_STATUS, Proposal } from 'src/types';
import { PROPOSAL_STATUSES, getStatusById } from 'util/statuses';
import './index.less';

type Props = RouteComponentProps<any>;

class ProposalsNaked extends React.Component<Props, {}> {
  componentDidMount() {
    this.setStoreFromQueryString();
    store.fetchProposals();
  }

  render() {
    const { page } = store.proposals;
    const loading = !page.fetched || page.fetching;
    const filters = page.filters
      .filter(f => f.startsWith('STATUS_'))
      .map(f => f.replace('STATUS_', '') as PROPOSAL_STATUS);

    const statusFilterMenu = (
      <Menu onClick={this.handleFilterClick}>
        {PROPOSAL_STATUSES.map(f => (
          <Menu.Item key={f.id}>{f.filterDisplay}</Menu.Item>
        ))}
      </Menu>
    );

    const sortMenu = (
      <Menu onClick={this.handleSortClick}>
        {/* NOTE: sync with /backend ... pagination.py ProposalPagination.SORT_MAP */}
        {['CREATED:DESC', 'CREATED:ASC', 'PUBLISHED:DESC', 'PUBLISHED:ASC'].map(s => (
          <Menu.Item key={s}>{s}</Menu.Item>
        ))}
      </Menu>
    );

    return (
      <div className="Proposals">
        <div className="Proposals-controls">
          <Input.Search
            className="Proposals-controls-search"
            placeholder="search titles"
            onSearch={this.handleSearch}
          />
          <Dropdown overlay={statusFilterMenu} trigger={['click']}>
            <Button>
              Filter <Icon type="down" />
            </Button>
          </Dropdown>
          <Dropdown overlay={sortMenu} trigger={['click']}>
            <Button>
              {'Sort ' + store.proposals.page.sort} <Icon type="down" />
            </Button>
          </Dropdown>
          <Button title="refresh" icon="reload" onClick={store.fetchProposals} />
        </div>

        {page.search && (
          <div>
            Search: <b>{page.search}</b>
          </div>
        )}

        {!!page.filters.length && (
          <div className="Proposals-filters">
            Filters:{' '}
            {filters.map(sf => (
              <Tag
                key={sf}
                onClose={() => this.handleFilterClose(sf)}
                color={getStatusById(PROPOSAL_STATUSES, sf).tagColor}
                closable
              >
                status: {sf}
              </Tag>
            ))}
            {filters.length > 1 && (
              <Tag key="clear" onClick={this.handleFilterClear}>
                clear
              </Tag>
            )}
          </div>
        )}

        <List
          className="Proposals-list"
          bordered
          dataSource={page.items}
          loading={loading}
          renderItem={(p: Proposal) => <ProposalItem key={p.proposalId} {...p} />}
        />

        <div className="Proposals-pagination">
          <Pagination
            current={page.page}
            total={page.total}
            pageSize={page.pageSize}
            onChange={this.handlePageChange}
            hideOnSinglePage={true}
          />
        </div>
      </div>
    );
  }

  private setStoreFromQueryString = () => {
    const parsed = qs.parse(this.props.history.location.search);

    // status filter
    if (parsed.status) {
      if (getStatusById(PROPOSAL_STATUSES, parsed.status)) {
        // here we reset to normal page query params, we might want
        // to do this every time we load or leave the component
        store.resetProposalPageQuery();
        store.addProposalPageFilter('STATUS_' + parsed.status);
      }
      this.props.history.replace(this.props.match.url); // remove qs
    }
  };

  private handleSortClick = (e: ClickParam) => {
    store.proposals.page.sort = e.key;
    store.fetchProposals();
  };

  private handleFilterClick = (e: ClickParam) => {
    store.addProposalPageFilter('STATUS_' + e.key);
    store.fetchProposals();
  };

  private handleFilterClose = (filter: PROPOSAL_STATUS) => {
    store.removeProposalPageFilter('STATUS_' + filter);
    store.fetchProposals();
  };

  private handleFilterClear = () => {
    store.proposals.page.filters = [];
    store.fetchProposals();
  };

  private handleSearch = (s: string) => {
    store.proposals.page.search = s;
    store.fetchProposals();
  };

  private handlePageChange = (p: number) => {
    store.proposals.page.page = p;
    store.fetchProposals();
  };
}

const Proposals = withRouter(view(ProposalsNaked));
export default Proposals;
