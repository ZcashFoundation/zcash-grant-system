import React from 'react';
import { AppState } from 'store/reducers';
import { Row, Col, Pagination } from 'antd';
import Loader from 'components/Loader';
import ProposalCard from '../ProposalCard';

interface Props {
  proposals: AppState['proposal']['proposals'];
  proposalsError: AppState['proposal']['proposalsError'];
  isFetchingProposals: AppState['proposal']['isFetchingProposals'];
}

interface State {
  page: number;
}

const PAGE_SIZE = 12;

export default class ProposalResults extends React.Component<Props, State> {
  state: State = {
    page: 1,
  };

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.proposals !== this.props.proposals) {
      this.setState({ page: 1 });
    }
  }

  render() {
    const { proposals, proposalsError, isFetchingProposals } = this.props;
    const { page } = this.state;

    if (isFetchingProposals) {
      return <Loader />;
    }

    if (proposalsError) {
      return (
        <>
          <h2>Something went wrong</h2>
          <p>{proposalsError}</p>
        </>
      );
    }

    const trimmedProposals = proposals.slice(
      (page - 1) * PAGE_SIZE,
      (page - 1) * PAGE_SIZE + PAGE_SIZE,
    );

    return (
      <Row gutter={20}>
        {proposals.length &&
          trimmedProposals.map(proposal => (
            <Col xl={8} lg={12} md={24} key={proposal.proposalId}>
              <ProposalCard {...proposal} />
            </Col>
          ))}
        {proposals.length && (
          <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination
              current={page}
              total={proposals.length}
              pageSize={PAGE_SIZE}
              onChange={this.changePage}
              hideOnSinglePage={true}
            />
          </Col>
        )}
        {!proposals.length && <h2>No proposals found</h2>}
      </Row>
    );
  }

  private changePage = (page: number) => {
    this.setState({ page });
  };
}
