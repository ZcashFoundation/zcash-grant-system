import React from 'react';
import { AppState } from 'store/reducers';
import { Row, Col, Pagination } from 'antd';
import Loader from 'components/Loader';
import ProposalCard from '../ProposalCard';
import './index.less';

interface Props {
  page: AppState['proposal']['page'];
  onPageChange: (page: number) => void;
}

export default class ProposalResults extends React.Component<Props, {}> {
  render() {
    const {
      items,
      fetchError,
      hasFetched,
      isFetching,
      page,
      total,
      pageSize,
      search,
    } = this.props.page;

    if (!hasFetched && isFetching) {
      return <Loader size="large" />;
    }

    if (fetchError) {
      return (
        <>
          <h2>Something went wrong</h2>
          <p>{fetchError}</p>
        </>
      );
    }

    return (
      <Row gutter={20} className="ProposalsResults">
        {!!items.length &&
          items.map(proposal => (
            <Col xl={8} lg={12} md={24} key={proposal.proposalId}>
              <ProposalCard {...proposal} />
            </Col>
          ))}
        {!!items.length && (
          <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination
              current={page}
              total={total}
              pageSize={pageSize}
              onChange={this.props.onPageChange}
              hideOnSinglePage={true}
            />
          </Col>
        )}
        {!items.length && (
          <h2>No proposals found {search && `for search term "${search}"`}</h2>
        )}
        {isFetching && <Loader overlay size="large" />}
      </Row>
    );
  }
}
