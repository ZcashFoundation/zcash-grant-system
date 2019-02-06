import React from 'react';
import { view } from 'react-easy-state';
import store from 'src/store';
import Pageable from 'components/Pageable';
import ContributionItem from './ContributionItem';
import { Contribution } from 'src/types';
import { PROPOSAL_STATUSES } from 'util/statuses';

class Contributions extends React.Component<{}> {
  render() {
    const { page } = store.contributions;
    // NOTE: sync with /backend ... pagination.py ContributionPagination.SORT_MAP
    const sorts = ['CREATED:DESC', 'CREATED:ASC', 'AMOUNT:DESC', 'AMOUNT:ASC'];
    return (
      <Pageable
        page={page}
        statuses={PROPOSAL_STATUSES}
        sorts={sorts}
        searchPlaceholder="Search proposal titles"
        renderItem={(c: Contribution) =>
          <ContributionItem key={c.id} contribution={c} />
        }
        handleSearch={store.fetchContributions}
        handleChangeQuery={store.setContributionPageQuery}
        handleResetQuery={store.resetContributionPageQuery}
      />
    );
  }
}

export default view(Contributions);
