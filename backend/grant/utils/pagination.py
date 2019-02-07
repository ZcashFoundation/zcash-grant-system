import abc
from sqlalchemy import or_, and_

from grant.proposal.models import db, ma, Proposal, ProposalContribution, proposal_contributions_schema
from .enums import ProposalStatus, ProposalStage, Category, ContributionStatus


def extract_filters(sw, strings):
    return [f[len(sw):] for f in strings if f.startswith(sw)]


class PaginationException(Exception):
    pass


class Pagination(abc.ABC):
    def validate_filters(self, filters: list):
        if self.FILTERS:
            for f in filters:
                if f not in self.FILTERS:
                    self._raise(f'unsupported filter: {f}')

    def validate_sort(self, sort: str):
        if self.SORT_MAP:
            if sort not in self.SORT_MAP:
                self._raise(f'unsupported sort: {sort}')

    def _raise(self, desc: str):
        name = self.__class__.__name__
        raise PaginationException(f'{name} {desc}')

    # if we ever want to do more interacting from outside
    # consider moving these args into __init__ and attaching to self
    @abc.abstractmethod
    def paginate(
        self,
        schema: ma.Schema,
        query: db.Query,
        page: int,
        filters: list,
        search: str,
        sort: str,
    ):
        pass


class ProposalPagination(Pagination):
    def __init__(self):
        self.FILTERS = [f'STATUS_{s}' for s in ProposalStatus.list()]
        self.FILTERS.extend([f'STAGE_{s}' for s in ProposalStage.list()])
        self.FILTERS.extend([f'CAT_{c}' for c in Category.list()])
        self.FILTERS.extend(['OTHER_ARBITER'])
        self.PAGE_SIZE = 9
        self.SORT_MAP = {
            'CREATED:DESC': Proposal.date_created.desc(),
            'CREATED:ASC': Proposal.date_created,
            'PUBLISHED:DESC': Proposal.date_published.desc(),  # NEWEST
            'PUBLISHED:ASC': Proposal.date_published,  # OLDEST
        }

    def paginate(
        self,
        schema: ma.Schema,
        query: db.Query=None,
        page: int=1,
        filters: list=None,
        search: str=None,
        sort: str='PUBLISHED:DESC',
    ):
        query = query or Proposal.query
        sort = sort or 'PUBLISHED:DESC'

        # FILTER
        if filters:
            self.validate_filters(filters)
            status_filters = extract_filters('STATUS_', filters)
            stage_filters = extract_filters('STAGE_', filters)
            cat_filters = extract_filters('CAT_', filters)
            other_filters = extract_filters('OTHER_', filters)

            if status_filters:
                query = query.filter(Proposal.status.in_(status_filters))
            # TODO: figure out what is going to happen with stages
            if stage_filters:
                self._raise('stage filters not yet supported')
            #     query = query.filter(Proposal.stage.in_(stage_filters))
            if cat_filters:
                query = query.filter(Proposal.category.in_(cat_filters))
            if other_filters:
                query = query.filter(Proposal.arbiter_id == None)

        # SORT (see self.SORT_MAP)
        if sort:
            self.validate_sort(sort)
            query = query.order_by(self.SORT_MAP[sort])

        # SEARCH
        if search:
            query = query.filter(Proposal.title.ilike(f'%{search}%'))

        res = query.paginate(page, self.PAGE_SIZE, False)
        return {
            'page': res.page,
            'total': res.total,
            'page_size': self.PAGE_SIZE,
            'items': schema.dump(res.items),
            'filters': filters,
            'search': search,
            'sort': sort
        }


class ContributionPagination(Pagination):
    def __init__(self):
        self.FILTERS = [f'STATUS_{s}' for s in ContributionStatus.list()]
        self.PAGE_SIZE = 9
        self.SORT_MAP = {
            'CREATED:DESC': ProposalContribution.date_created.desc(),
            'CREATED:ASC': ProposalContribution.date_created,
            'AMOUNT:DESC': ProposalContribution.amount.desc(),
            'AMOUNT:ASC': ProposalContribution.amount,
        }

    def paginate(
        self,
        schema: ma.Schema=proposal_contributions_schema,
        query: db.Query=None,
        page: int=1,
        filters: list=None,
        search: str=None,
        sort: str='PUBLISHED:DESC',
    ):
        query = query or ProposalContribution.query
        sort = sort or 'CREATED:DESC'

        # FILTER
        if filters:
            self.validate_filters(filters)
            status_filters = extract_filters('STATUS_', filters)

            if status_filters:
                query = query.filter(ProposalContribution.status.in_(status_filters))

        # SORT (see self.SORT_MAP)
        if sort:
            self.validate_sort(sort)
            query = query.order_by(self.SORT_MAP[sort])

        # SEARCH can match txids or amounts
        if search:
            query = query.filter(or_(
                ProposalContribution.amount.ilike(f'%{search}%'),
                ProposalContribution.tx_id.ilike(f'%{search}%'),
            ))

        res = query.paginate(page, self.PAGE_SIZE, False)
        return {
            'page': res.page,
            'total': res.total,
            'page_size': self.PAGE_SIZE,
            'items': schema.dump(res.items),
            'filters': filters,
            'search': search,
            'sort': sort
        }


# expose pagination methods here
proposal = ProposalPagination().paginate
contribution = ContributionPagination().paginate
# comment = CommentPagination().paginate
# user = UserPagination().paginate
