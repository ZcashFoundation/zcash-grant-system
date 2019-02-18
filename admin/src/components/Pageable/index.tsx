import React from 'react';
import qs from 'query-string';
import { uniq, without } from 'lodash';
import { Icon, Button, Dropdown, Menu, Tag, List, Input, Pagination } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import { RouteComponentProps, withRouter } from 'react-router';
import { PageData, PageQuery } from 'src/types';
import { Filters } from 'util/filters';
import './index.less';

interface OwnProps<T> {
  page: PageData<T>;
  filters: Filters;
  sorts: string[];
  searchPlaceholder?: string;
  controlsExtra?: React.ReactNode;
  renderItem(item: T): React.ReactNode;
  handleSearch(): void;
  handleChangeQuery(query: Partial<PageQuery>): void;
  handleResetQuery(): void;
}

type Props<T> = OwnProps<T> & RouteComponentProps<any>;

class Pageable<T> extends React.Component<Props<T>, {}> {
  componentDidMount() {
    this.setQueryFromUrl();
    this.props.handleSearch();
  }

  render() {
    const {
      page,
      filters,
      sorts,
      renderItem,
      searchPlaceholder,
      controlsExtra,
    } = this.props;
    const loading = !page.fetched || page.fetching;

    const statusFilterMenu = (
      <Menu onClick={this.handleFilterClick}>
        {filters.list.map(f => (
          <Menu.Item key={f.id}>{f.display}</Menu.Item>
        ))}
      </Menu>
    );

    const sortMenu = (
      <Menu onClick={this.handleSortClick}>
        {sorts.map(s => (
          <Menu.Item key={s}>{s}</Menu.Item>
        ))}
      </Menu>
    );

    return (
      <div className="Pageable">
        <div className="Pageable-controls">
          <Input.Search
            className="Pageable-controls-search"
            placeholder={searchPlaceholder}
            onSearch={this.handleSearch}
          />
          <Dropdown overlay={statusFilterMenu} trigger={['click']}>
            <Button>
              Filter <Icon type="down" />
            </Button>
          </Dropdown>
          <Dropdown overlay={sortMenu} trigger={['click']}>
            <Button>
              {'Sort ' + page.sort} <Icon type="down" />
            </Button>
          </Dropdown>
          <Button title="refresh" icon="reload" onClick={this.props.handleSearch} />

          {controlsExtra && (
            <div className="Pageable-controls-extra">{controlsExtra}</div>
          )}
        </div>

        {page.search && (
          <div>
            Search: <b>{page.search}</b>
          </div>
        )}

        {!!page.filters.length && (
          <div className="Pageable-filters">
            Filters:{' '}
            {page.filters.map(fId => {
              const f = filters.getById(fId);
              return (
                <Tag
                  key={fId}
                  onClose={() => this.handleFilterClose(fId)}
                  color={f.color}
                  closable
                >
                  {f.display}
                </Tag>
              );
            })}
            {page.filters.length > 1 && (
              <Tag key="clear" onClick={this.handleFilterClear}>
                clear
              </Tag>
            )}
          </div>
        )}

        <List
          className="Pageable-list"
          bordered
          dataSource={page.items}
          loading={loading}
          renderItem={renderItem}
        />

        <div className="Pageable-pagination">
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

  private setQueryFromUrl = () => {
    const { history, match, handleResetQuery, handleChangeQuery } = this.props;
    const parsed = qs.parse(history.location.search, { arrayFormat: 'bracket' });

    // filters
    if (parsed.filters) {
      handleResetQuery();
      handleChangeQuery({ filters: parsed.filters });
      history.replace(match.url); // remove qs
    }
  };

  private handleSortClick = (e: ClickParam) => {
    this.props.handleChangeQuery({ sort: e.key });
    this.props.handleSearch();
  };

  private handleFilterClick = (e: ClickParam) => {
    const { page, handleChangeQuery, handleSearch } = this.props;
    handleChangeQuery({
      filters: uniq([e.key, ...page.filters]),
    });
    handleSearch();
  };

  private handleFilterClose = (filter: string) => {
    const { page, handleChangeQuery, handleSearch } = this.props;
    handleChangeQuery({ filters: without(page.filters, filter) });
    handleSearch();
  };

  private handleFilterClear = () => {
    this.props.handleChangeQuery({ filters: [] });
    this.props.handleSearch();
  };

  private handleSearch = (s: string) => {
    this.props.handleChangeQuery({ search: s });
    this.props.handleSearch();
  };

  private handlePageChange = (p: number) => {
    this.props.handleChangeQuery({ page: p });
    this.props.handleSearch();
  };
}

export default withRouter(Pageable);
