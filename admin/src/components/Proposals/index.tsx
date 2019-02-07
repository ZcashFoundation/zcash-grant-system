import React from 'react';
import { view } from 'react-easy-state';
import store from 'src/store';
import ProposalItem from './ProposalItem';
import Pageable from 'components/Pageable';
import { Proposal } from 'src/types';
import { PROPOSAL_STATUSES } from 'util/statuses';

class Proposals extends React.Component<{}> {
  render() {
    const { page } = store.proposals;
    // NOTE: sync with /backend ... pagination.py ProposalPagination.SORT_MAP
    const sorts = ['CREATED:DESC', 'CREATED:ASC', 'PUBLISHED:DESC', 'PUBLISHED:ASC'];
    return (
      <Pageable
        page={page}
        statuses={PROPOSAL_STATUSES}
        sorts={sorts}
        searchPlaceholder="Search proposal titles"
        renderItem={(p: Proposal) => <ProposalItem key={p.proposalId} {...p} />}
        handleSearch={store.fetchProposals}
        handleChangeQuery={store.setProposalPageQuery}
        handleResetQuery={store.resetProposalPageQuery}
      />
    );
  }
}

export default view(Proposals);
