import React from 'react';
import { Select, Radio, Card } from 'antd';
import qs from 'query-string';
import { withRouter, RouteComponentProps } from 'react-router';
import { RadioChangeEvent } from 'antd/lib/radio';
import { SelectValue } from 'antd/lib/select';
import {
  PROPOSAL_SORT,
  SORT_LABELS,
  PROPOSAL_STAGE,
  STAGE_UI,
  CUSTOM_FILTERS,
} from 'api/constants';
import { typedKeys } from 'utils/ts';
import { ProposalPage } from 'types';

interface OwnProps {
  sort: ProposalPage['sort'];
  filters: ProposalPage['filters'];
  handleChangeSort(sort: ProposalPage['sort']): void;
  handleChangeFilters(filters: ProposalPage['filters']): void;
}

type Props = OwnProps & RouteComponentProps<any>;

const filterToActual: { [key: string]: string } = {
  with_funding: 'ACCEPTED_WITH_FUNDING',
  without_funding: 'ACCEPTED_WITHOUT_FUNDING',
  public_review: 'STATUS_DISCUSSION',
  in_progress: 'WIP',
  completed: 'COMPLETED',
};

const actualToFilter: { [key: string]: string } = {
  ACCEPTED_WITH_FUNDING: 'with_funding',
  ACCEPTED_WITHOUT_FUNDING: 'without_funding',
  STATUS_DISCUSSION: 'public_review',
  WIP: 'in_progress',
  COMPLETED: 'completed',
};

class ProposalFilters extends React.Component<Props> {
  componentDidMount() {
    const urlFilter = this.getFilterFromUrl(this.props.location);
    if (!urlFilter) return;

    const translatedFilter = filterToActual[urlFilter.toLowerCase()];
    if (!translatedFilter) return;

    const activeFilter = this.getActiveFilter();

    if (translatedFilter !== activeFilter) {
      this.handleStageChange({ target: { value: translatedFilter } } as RadioChangeEvent);
    }
  }

  render() {
    const { sort, filters } = this.props;

    const combinedFilters = [...filters.stage, ...filters.custom];

    return (
      <div>
        <Card title="Filter" extra={<a onClick={this.resetFilters}>Reset</a>}>
          <div style={{ marginBottom: '0.25rem' }}>
            <Radio
              value="ALL"
              name="stage"
              checked={combinedFilters.length === 0}
              onChange={this.handleStageChange}
            >
              All
            </Radio>
          </div>
          {typedKeys(STAGE_UI)
            .filter(
              s =>
                ![
                  PROPOSAL_STAGE.PREVIEW,
                  PROPOSAL_STAGE.FAILED,
                  PROPOSAL_STAGE.CANCELED,
                  PROPOSAL_STAGE.FUNDING_REQUIRED,
                ].includes(s as PROPOSAL_STAGE),
            ) // skip a few
            .map(s => (
              <div key={s} style={{ marginBottom: '0.25rem' }}>
                <Radio
                  value={s}
                  name="stage"
                  checked={combinedFilters.includes(s)}
                  onChange={this.handleStageChange}
                >
                  {STAGE_UI[s].label}
                </Radio>
              </div>
            ))}
        </Card>
        <div style={{ marginBottom: '1rem' }} />
        <Card title="Sort">
          <Select onChange={this.handleChangeSort} value={sort} style={{ width: '100%' }}>
            {typedKeys(PROPOSAL_SORT).map(s => (
              <Select.Option key={s} value={s}>
                {SORT_LABELS[s]}
              </Select.Option>
            ))}
          </Select>
        </Card>
      </div>
    );
  }

  private getFilterFromUrl(
    location: RouteComponentProps['location'],
  ): string | undefined {
    const args = qs.parse(location.search);
    return args.filter;
  }

  private getActiveFilter(): string {
    const { filters } = this.props;
    const combinedFilters = [...filters.stage, ...filters.custom];

    return combinedFilters.length ? combinedFilters[0].toUpperCase() : 'ALL';
  }

  private handleStageChange = (ev: RadioChangeEvent) => {
    let stage: PROPOSAL_STAGE[] = [];
    let custom: CUSTOM_FILTERS[] = [];
    const { value } = ev.target;
    if (value !== 'ALL') {
      if (Object.values(PROPOSAL_STAGE).includes(value)) {
        stage = [value];
      }

      if (Object.values(CUSTOM_FILTERS).includes(value)) {
        custom = [value];
      }

      const targetFilter = actualToFilter[value];
      if (targetFilter) {
        this.props.history.push(`/proposals/?filter=${targetFilter}`);
      }
    } else {
      // if a filter is set, remove it
      if (this.props.location.pathname === '/proposals/') {
        this.props.history.push('/proposals');
      }
    }
    this.props.handleChangeFilters({
      ...this.props.filters,
      stage,
      custom,
    });
  };

  private handleChangeSort = (sort: SelectValue) => {
    this.props.handleChangeSort(sort as PROPOSAL_SORT);
  };

  private resetFilters = (ev?: React.MouseEvent<HTMLAnchorElement>) => {
    if (ev) {
      ev.preventDefault();
    }
    this.props.handleChangeFilters({
      category: [],
      stage: [],
      custom: [],
    });
  };
}

export default withRouter(ProposalFilters);
