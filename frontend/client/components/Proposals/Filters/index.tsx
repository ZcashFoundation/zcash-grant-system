import React from 'react';
import { Select, Radio, Card } from 'antd';
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

interface Props {
  sort: ProposalPage['sort'];
  filters: ProposalPage['filters'];
  handleChangeSort(sort: ProposalPage['sort']): void;
  handleChangeFilters(filters: ProposalPage['filters']): void;
}

export default class ProposalFilters extends React.Component<Props> {
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
