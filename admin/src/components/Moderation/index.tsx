import React from 'react';
import { view } from 'react-easy-state';
import store from 'src/store';
// import ProposalItem from './ProposalItem';
import Pageable from 'components/Pageable';
import { Comment } from 'src/types';
import { proposalFilters } from 'util/filters';

class Moderation extends React.Component<{}> {
  render() {
    const { page } = store.comments;
    // NOTE: sync with /backend ... pagination.py ProposalCommentPagination.SORT_MAP
    const sorts = ['CREATED:DESC', 'CREATED:ASC', 'PUBLISHED:DESC', 'PUBLISHED:ASC'];
    return (
      <Pageable
        page={page}
        filters={proposalFilters}
        sorts={sorts}
        searchPlaceholder="Search comment content"
        renderItem={(p: Comment) => <div key={p.id}>{p.content}</div>}
        handleSearch={store.fetchComments}
        handleChangeQuery={store.setCommentPageParams}
        handleResetQuery={store.resetCommentPageParams}
      />
    );
  }
}

export default view(Moderation);
