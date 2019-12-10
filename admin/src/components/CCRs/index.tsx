import React from 'react';
import { view } from 'react-easy-state';
import store from 'src/store';
import CCRItem from './CCRItem';
import Pageable from 'components/Pageable';
import { CCR } from 'src/types';
import { ccrFilters } from 'util/filters';

class CCRs extends React.Component<{}> {
  render() {
    const { page } = store.ccrs;
    // NOTE: sync with /backend ... pagination.py CCRPagination.SORT_MAP
    const sorts = ['CREATED:DESC', 'CREATED:ASC'];
    return (
      <Pageable
        page={page}
        filters={ccrFilters}
        sorts={sorts}
        searchPlaceholder="Search CCR titles"
        renderItem={(c: CCR) => <CCRItem key={c.ccrId} {...c} />}
        handleSearch={store.fetchCCRs}
        handleChangeQuery={store.setCCRPageQuery}
        handleResetQuery={store.resetCCRPageQuery}
      />
    );
  }
}

export default view(CCRs);
