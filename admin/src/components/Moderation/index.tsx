import React from 'react';
import { view } from 'react-easy-state';
import store from 'src/store';
import ModerationItem from './ModerationItem';
import Pageable from 'components/Pageable';
import { Comment } from 'src/types';
import { commentFilters } from 'src/util/filters';

class Moderation extends React.Component<{}> {
  render() {
    const { page } = store.comments;
    // NOTE: sync with /backend ... pagination.py ProposalCommentPagination.SORT_MAP
    const sorts = ['CREATED:DESC', 'CREATED:ASC'];
    return (
      <Pageable
        page={page}
        filters={commentFilters}
        sorts={sorts}
        searchPlaceholder="Search comment content"
        renderItem={(p: Comment) => <ModerationItem key={p.id} {...p} />}
        handleSearch={store.fetchComments}
        handleChangeQuery={store.setCommentPageParams}
        handleResetQuery={store.resetCommentPageParams}
      />
    );
  }
}

export default view(Moderation);
