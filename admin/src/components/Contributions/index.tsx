import React from 'react';
import { view } from 'react-easy-state';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import store from 'src/store';
import Pageable from 'components/Pageable';
import ContributionItem from './ContributionItem';
import { Contribution } from 'src/types';
import { contributionFilters } from 'util/filters';

class Contributions extends React.Component<{}> {
  render() {
    const { page } = store.contributions;
    // NOTE: sync with /backend ... pagination.py ContributionPagination.SORT_MAP
    const sorts = ['CREATED:DESC', 'CREATED:ASC', 'AMOUNT:DESC', 'AMOUNT:ASC'];
    return (
      <Pageable
        page={page}
        filters={contributionFilters}
        sorts={sorts}
        searchPlaceholder="Search amount or txid"
        controlsExtra={
          <Link to="/contributions/new">
            <Button icon="plus">Create a contribution</Button>
          </Link>
        }
        renderItem={(c: Contribution) => <ContributionItem key={c.id} contribution={c} />}
        handleSearch={store.fetchContributions}
        handleChangeQuery={store.setContributionPageQuery}
        handleResetQuery={store.resetContributionPageQuery}
      />
    );
  }
}

export default view(Contributions);
