import React from 'react';
import { Select, Radio, Card } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import { SelectValue } from 'antd/lib/select';
import { PROPOSAL_SORT, SORT_LABELS, PROPOSAL_STAGE, STAGE_UI } from 'api/constants';
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
          <h3>Proposal stage</h3>
          <div style={{ marginBottom: '0.25rem' }}>
            <Radio
              value="ALL"
              name="stage"
              checked={filters.stage.length === 0}
              onChange={this.handleStageChange}
            >
              All
            </Radio>
          </div>
          {typedKeys(PROPOSAL_STAGE)
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
                  checked={filters.stage.includes(s as PROPOSAL_STAGE)}
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

  private handleStageChange = (ev: RadioChangeEvent) => {
    let stage = [] as PROPOSAL_STAGE[];
    if (ev.target.value !== 'ALL') {
      stage = [ev.target.value as PROPOSAL_STAGE];
    }
    this.props.handleChangeFilters({
      ...this.props.filters,
      stage,
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
    });
  };
}
