import React from 'react';
import { Select, Checkbox, Radio, Card, Divider } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import {
  PROPOSAL_SORT,
  SORT_LABELS,
  PROPOSAL_CATEGORY,
  CATEGORY_UI,
  PROPOSAL_STAGE,
  STAGE_UI,
} from 'api/constants';

export interface Filters {
  categories: PROPOSAL_CATEGORY[];
  stage: PROPOSAL_STAGE | null;
}

interface Props {
  sort: PROPOSAL_SORT;
  filters: Filters;
  handleChangeSort(sort: PROPOSAL_SORT): void;
  handleChangeFilters(filters: Filters): void;
}

export default class ProposalFilters extends React.Component<Props> {
  render() {
    const { sort, filters, handleChangeSort } = this.props;

    return (
      <div>
        <Card title="Sort">
          <Select onChange={handleChangeSort} value={sort} style={{ width: '100%' }}>
            {Object.keys(PROPOSAL_SORT).map((s: PROPOSAL_SORT) => (
              <Select.Option key={s} value={s}>
                {SORT_LABELS[s]}
              </Select.Option>
            ))}
          </Select>
        </Card>

        <div style={{ marginBottom: '1rem' }} />

        <Card title="Filter" extra={<a onClick={this.resetFilters}>Reset</a>}>
          <h3>Category</h3>
          {Object.keys(PROPOSAL_CATEGORY).map((c: PROPOSAL_CATEGORY) => (
            <div key={c} style={{ marginBottom: '0.25rem' }}>
              <Checkbox
                checked={filters.categories.includes(c)}
                value={c}
                onChange={this.handleCategoryChange}
              >
                {CATEGORY_UI[c].label}
              </Checkbox>
            </div>
          ))}

          <Divider />

          <h3>Proposal stage</h3>
          {Object.keys(PROPOSAL_STAGE).map((s: PROPOSAL_STAGE) => (
            <div key={s} style={{ marginBottom: '0.25rem' }}>
              <Radio
                value={s}
                name="stage"
                checked={s === filters.stage}
                onChange={this.handleStageChange}
              >
                {STAGE_UI[s].label}
              </Radio>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  private handleCategoryChange = (ev: RadioChangeEvent) => {
    const { filters } = this.props;
    const category = ev.target.value as PROPOSAL_CATEGORY;
    const categories = ev.target.checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);

    this.props.handleChangeFilters({
      ...filters,
      categories,
    });
  };

  private handleStageChange = (ev: RadioChangeEvent) => {
    this.props.handleChangeFilters({
      ...this.props.filters,
      stage: ev.target.value as PROPOSAL_STAGE,
    });
  };

  private resetFilters = (ev?: React.MouseEvent<HTMLAnchorElement>) => {
    if (ev) {
      ev.preventDefault();
    }

    this.props.handleChangeFilters({
      categories: [],
      stage: null,
    });
  };
}
