import { uniq, without } from 'lodash';
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
import { PROPOSAL_OTHER_FILTERS, getProposalOtherFilterById } from 'util/filters';
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
    const filterCount = page.filters.status.length + page.filters.other.length;

    const statusFilterMenu = (
      <Menu onClick={this.handleFilterClick}>
        {PROPOSAL_STATUSES.map(f => (
          <Menu.Item key={'s_' + f.id}>{f.filterDisplay}</Menu.Item>
        ))}
        {PROPOSAL_OTHER_FILTERS.map(f => (
          <Menu.Item key={'o_' + f.id}>{f.filterDisplay}</Menu.Item>
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

        {!!filterCount && (
          <div className="Proposals-filters">
            Filters:{' '}
            {page.filters.status.map(x => getStatusById(PROPOSAL_STATUSES, x)).map(sf => (
              <Tag
                key={sf.id}
                onClose={() => this.handleStatusFilterClose(sf.id)}
                color={sf.tagColor}
                closable
              >
                {sf.filterDisplay}
              </Tag>
            ))}
            {page.filters.other.map(x => getProposalOtherFilterById(x)).map(of => (
              <Tag
                key={of.id}
                onClose={() => this.handleOtherFilterClose(of.id)}
                color={of.tagColor}
                closable
              >
                {of.filterDisplay}
              </Tag>
            ))}
            {filterCount > 1 && (
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

  private addStatusFilter = (filter: PROPOSAL_STATUS) => {
    const { status } = store.proposals.page.filters;
    store.proposals.page.filters.status = uniq([...status, filter]);
  };

  private removeStatusFilter = (filter: PROPOSAL_STATUS) => {
    const { status } = store.proposals.page.filters;
    store.proposals.page.filters.status = without(status, filter);
  };

  private addOtherFilter = (filter: string) => {
    const { other } = store.proposals.page.filters;
    store.proposals.page.filters.other = uniq([...other, filter]);
  };

  private removeOtherFilter = (filter: string) => {
    const { other } = store.proposals.page.filters;
    store.proposals.page.filters.other = without(other, filter);
  };

  private setStoreFromQueryString = () => {
    const parsed = qs.parse(this.props.history.location.search);

    // status filter
    if (parsed.status || parsed.other) {
      // here we reset to normal page query params, we might want
      // to do this every time we load or leave the component
      store.resetProposalPageQuery();
      if (parsed.status && getStatusById(PROPOSAL_STATUSES, parsed.status)) {
        this.addStatusFilter(parsed.status);
      }
      if (parsed.other && getProposalOtherFilterById(parsed.other)) {
        this.addOtherFilter(parsed.other);
      }
      this.props.history.replace(this.props.match.url); // remove qs
    }
  };

  private handleSortClick = (e: ClickParam) => {
    store.proposals.page.sort = e.key;
    store.fetchProposals();
  };

  private handleFilterClick = (e: ClickParam) => {
    // tagged keys to differentiate filter types in antd dropdown
    if (e.key.startsWith('s_')) {
      this.addStatusFilter(e.key.replace('s_', '') as PROPOSAL_STATUS);
      store.fetchProposals();
    } else if (e.key.startsWith('o_')) {
      this.addOtherFilter(e.key.replace('o_', ''));
      store.fetchProposals();
    }
  };

  private handleStatusFilterClose = (filter: PROPOSAL_STATUS) => {
    this.removeStatusFilter(filter);
    store.fetchProposals();
  };

  private handleOtherFilterClose = (filter: string) => {
    this.removeOtherFilter(filter);
    store.fetchProposals();
  };

  private handleFilterClear = () => {
    store.proposals.page.filters = { status: [], other: [] };
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
