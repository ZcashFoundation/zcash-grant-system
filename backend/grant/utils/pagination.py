from sqlalchemy import or_, and_

from grant.proposal.models import db, ma, Proposal
from .enums import ProposalStatus, ProposalStage, ProposalSort, Category


class PaginationException(Exception):
    pass


PROPOSAL_FILTERS = [f'STATUS_{s}' for s in ProposalStatus.list()]
PROPOSAL_FILTERS.extend([f'STAGE_{s}' for s in ProposalStage.list()])
PROPOSAL_FILTERS.extend([f'CAT_{c}' for c in Category.list()])


def extract_filters(sw, strings):
    return [f[len(sw):] for f in strings if f.startswith(sw)]


def proposal_paginate(
    schema: ma.Schema,
    query: db.Query=None,
    page: int=1,
    filters: list=None,
    search: str=None,
    sort: str=ProposalSort.NEWEST,
):
    PAGE_SIZE = 9
    query = query or Proposal.query

    # FILTER
    if filters:
        for f in filters:
            if f not in PROPOSAL_FILTERS:
                raise PaginationException(f'proposal pagination - unsupported filter: {f}')
        status_filters = extract_filters('STATUS_', filters)
        stage_filters = extract_filters('STAGE_', filters)
        cat_filters = extract_filters('CAT_', filters)

        if status_filters:
            query = query.filter(Proposal.status.in_(status_filters))
        # TODO: figure out what is going to happen with stages
        if stage_filters:
            raise PaginationException(f'proposal pagination - stage filters not yet supported')
        #     query = query.filter(Proposal.stage.in_(stage_filters))
        if cat_filters:
            query = query.filter(Proposal.category.in_(cat_filters))

    # SORT
    sort_map = {
        'NEWEST': Proposal.date_published.desc(),
        'OLDEST': Proposal.date_published,
        # TODO: tricky due to hybrid fields & strings instead of floats
        # 'MOST_FUNDED': ...
        # 'LEAST_FUNDED': ...
    }
    if sort not in sort_map:
        raise PaginationException(f'proposal pagination - unsupported sort: {sort}')
    query = query.order_by(sort_map[sort])

    # SEARCH
    if search:
        query = query.filter(Proposal.title.ilike(f'%{search}%'))

    res = query.paginate(page, PAGE_SIZE, False)
    return {
        'page': res.page,
        'total': res.total,
        'page_size': PAGE_SIZE,
        'items': schema.dump(res.items),
        'filters': filters,
        'search': search,
        'sort': sort
    }
