import React from 'react';
import { Select, Checkbox, Radio, Card, Divider } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import { SelectValue } from 'antd/lib/select';
import {
  PROPOSAL_SORT,
  SORT_LABELS,
  PROPOSAL_CATEGORY,
  CATEGORY_UI,
  PROPOSAL_STAGE,
  STAGE_UI,
} from 'api/constants';
import { typedKeys } from 'utils/ts';

interface Props {
  sort: PROPOSAL_SORT;
  filters: string[];
  handleChangeSort(sort: PROPOSAL_SORT): void;
  handleChangeFilters(filters: string[]): void;
}

export default class ProposalFilters extends React.Component<Props> {
  render() {
    const { sort, filters } = this.props;

    return (
      <div>
        <Card title="Sort">
          <Select onChange={this.handleChangeSort} value={sort} style={{ width: '100%' }}>
            {typedKeys(PROPOSAL_SORT).map(s => (
              <Select.Option key={s} value={s}>
                {SORT_LABELS[s]}
              </Select.Option>
            ))}
          </Select>
        </Card>

        <div style={{ marginBottom: '1rem' }} />

        <Card title="Filter" extra={<a onClick={this.resetFilters}>Reset</a>}>
          <h3>Category</h3>
          {typedKeys(PROPOSAL_CATEGORY).map(c => (
            <div key={c} style={{ marginBottom: '0.25rem' }}>
              <Checkbox
                checked={filters.includes('CAT_' + c)}
                value={'CAT_' + c}
                onChange={this.handleFilterChange}
              >
                {CATEGORY_UI[c].label}
              </Checkbox>
            </div>
          ))}

          <Divider />

          <h3>Proposal stage</h3>
          {typedKeys(PROPOSAL_STAGE).map(s => (
            <div key={s} style={{ marginBottom: '0.25rem' }}>
              <Radio
                value={'STAGE_' + s}
                name="stage"
                checked={filters.includes('STAGE_' + s)}
                onChange={this.handleFilterChange}
              >
                {STAGE_UI[s].label}
              </Radio>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  private handleFilterChange = (ev: RadioChangeEvent) => {
    const { filters } = this.props;
    const filter = ev.target.value;
    let newFilters;
    // only one stage at a time (radio)
    if (filter.startsWith('STAGE_')) {
      newFilters = [...filters.filter(s => !s.startsWith('STAGE_')), filter];
    } else {
      // allow multiple (checkbox)
      newFilters = ev.target.checked
        ? [...filters, filter]
        : filters.filter(c => c !== filter);
    }

    this.props.handleChangeFilters(newFilters);
  };

  private handleChangeSort = (sort: SelectValue) => {
    this.props.handleChangeSort(sort as PROPOSAL_SORT);
  };

  private resetFilters = (ev?: React.MouseEvent<HTMLAnchorElement>) => {
    if (ev) {
      ev.preventDefault();
    }
    this.props.handleChangeFilters([]);
  };
}
