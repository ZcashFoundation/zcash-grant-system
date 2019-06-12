import abc
from sqlalchemy import or_, and_

from grant.comment.models import Comment, comments_schema
from grant.proposal.models import db, ma, Proposal, ProposalContribution, ProposalArbiter, proposal_contributions_schema
from grant.comment.models import Comment, comments_schema
from grant.user.models import User, UserSettings, users_schema
from grant.milestone.models import Milestone
from .enums import ProposalStatus, ProposalStage, Category, ContributionStatus, ProposalArbiterStatus, MilestoneStage


def extract_filters(sw, strings):
    filters = [f[len(sw):] for f in strings if f.startswith(sw)]
    filters = [f for f in filters if not f.startswith('NOT_')]
    return filters


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
        self.FILTERS.extend([f'STAGE_NOT_{s}' for s in ProposalStage.list()])
        self.FILTERS.extend([f'CAT_{c}' for c in Category.list()])
        self.FILTERS.extend([f'ARBITER_{c}' for c in ProposalArbiterStatus.list()])
        self.FILTERS.extend([f'MILESTONE_{c}' for c in MilestoneStage.list()])
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
            stage_not_filters = extract_filters('STAGE_NOT_', filters, )
            cat_filters = extract_filters('CAT_', filters)
            arbiter_filters = extract_filters('ARBITER_', filters)
            milestone_filters = extract_filters('MILESTONE_', filters)

            if status_filters:
                query = query.filter(Proposal.status.in_(status_filters))
            if stage_filters:
                query = query.filter(Proposal.stage.in_(stage_filters))
            if stage_not_filters:
                query = query.filter(Proposal.stage.notin_(stage_not_filters))
            if cat_filters:
                query = query.filter(Proposal.category.in_(cat_filters))
            if arbiter_filters:
                query = query.join(Proposal.arbiter) \
                    .filter(ProposalArbiter.status.in_(arbiter_filters))
            if milestone_filters:
                query = query.join(Proposal.milestones) \
                    .filter(Milestone.stage.in_(milestone_filters))

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
        self.FILTERS.extend(['REFUNDABLE', 'DONATION'])
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

            if 'REFUNDABLE' in filters:
                query = query.filter(ProposalContribution.refund_tx_id == None) \
                    .filter(ProposalContribution.staking == False) \
                    .filter(ProposalContribution.status == ContributionStatus.CONFIRMED) \
                    .join(Proposal) \
                    .filter(or_(
                        Proposal.stage == ProposalStage.FAILED,
                        Proposal.stage == ProposalStage.CANCELED,
                    )) \
                    .join(ProposalContribution.user) \
                    .join(UserSettings) \
                    .filter(UserSettings.refund_address != None)

            if 'DONATION' in filters:
                query = query.filter(ProposalContribution.refund_tx_id == None) \
                    .filter(ProposalContribution.status == ContributionStatus.CONFIRMED) \
                    .join(Proposal) \
                    .filter(or_(
                        Proposal.stage == ProposalStage.FAILED,
                        Proposal.stage == ProposalStage.CANCELED,
                    )) \
                    .join(ProposalContribution.user, isouter=True) \
                    .join(UserSettings, isouter=True) \
                    .filter(UserSettings.refund_address == None)

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


class UserPagination(Pagination):
    def __init__(self):
        self.FILTERS = ['BANNED', 'SILENCED', 'ARBITER']
        self.PAGE_SIZE = 9
        self.SORT_MAP = {
            'EMAIL:DESC': User.email_address.desc(),
            'EMAIL:ASC': User.email_address,
            'NAME:DESC': User.display_name.desc(),
            'NAME:ASC': User.display_name,
        }

    def paginate(
        self,
        schema: ma.Schema=users_schema,
        query: db.Query=None,
        page: int=1,
        filters: list=None,
        search: str=None,
        sort: str='EMAIL:DESC',
    ):
        query = query or Proposal.query
        sort = sort or 'EMAIL:DESC'

        # FILTER
        if filters:
            self.validate_filters(filters)
            if 'BANNED' in filters:
                query = query.filter(User.banned == True)
            if 'SILENCED' in filters:
                query = query.filter(User.silenced == True)
            if 'ARBITER' in filters:
                query = query.join(User.arbiter_proposals) \
                    .filter(ProposalArbiter.status == ProposalArbiterStatus.ACCEPTED)

        # SORT (see self.SORT_MAP)
        if sort:
            self.validate_sort(sort)
            query = query.order_by(self.SORT_MAP[sort])

        # SEARCH
        if search:
            query = query.filter(
                User.email_address.ilike(f'%{search}%') |
                User.display_name.ilike(f'%{search}%')
            )

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


class CommentPagination(Pagination):
    def __init__(self):
        self.FILTERS = ['REPORTED', 'HIDDEN']
        self.PAGE_SIZE = 10
        self.SORT_MAP = {
            'CREATED:DESC': Comment.date_created.desc(),
            'CREATED:ASC': Comment.date_created,
        }

    def paginate(
        self,
        schema: ma.Schema=comments_schema,
        query: db.Query=None,
        page: int=1,
        filters: list=None,
        search: str=None,
        sort: str='CREATED:DESC',
    ):
        query = query or Comment.query
        sort = sort or 'CREATED:DESC'

        # FILTER
        if filters:
            self.validate_filters(filters)
            if 'REPORTED' in filters:
                query = query.filter(Comment.reported == True)
            if 'HIDDEN' in filters:
                query = query.filter(Comment.hidden == True)

        # SORT (see self.SORT_MAP)
        if sort:
            self.validate_sort(sort)
            query = query.order_by(self.SORT_MAP[sort])

        # SEARCH
        if search:
            query = query.filter(
                Comment.content.ilike(f'%{search}%')
            )

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
comment = CommentPagination().paginate
user = UserPagination().paginate
