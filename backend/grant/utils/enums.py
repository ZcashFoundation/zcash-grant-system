# Our own Enum class with custom functionality, not Python's
class CustomEnum():
    # Adds an .includes function that tests if a value is in enum
    def includes(self, enum: str):
        return hasattr(self, enum)

    # provide a list of enum values (strs)
    def list(self):
        return [attr for attr in dir(self)
                if not callable(getattr(self, attr)) and
                not attr.startswith('__')]


class CCRStatusEnum(CustomEnum):
    DRAFT = 'DRAFT'
    PENDING = 'PENDING'
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'
    LIVE = 'LIVE'
    DELETED = 'DELETED'


CCRStatus = CCRStatusEnum()


class ProposalStatusEnum(CustomEnum):
    DRAFT = 'DRAFT'
    LIVE_DRAFT = 'LIVE_DRAFT'
    ARCHIVED = 'ARCHIVED'
    STAKING = 'STAKING'
    DISCUSSION = 'DISCUSSION'
    PENDING = 'PENDING'
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'
    LIVE = 'LIVE'
    DELETED = 'DELETED'


ProposalStatus = ProposalStatusEnum()


class ProposalSortEnum(CustomEnum):
    NEWEST = 'NEWEST'
    OLDEST = 'OLDEST'


ProposalSort = ProposalSortEnum()


class ProposalStageEnum(CustomEnum):
    PREVIEW = 'PREVIEW'
    WIP = 'WIP'
    COMPLETED = 'COMPLETED'
    FAILED = 'FAILED'
    CANCELED = 'CANCELED'


ProposalStage = ProposalStageEnum()


class CategoryEnum(CustomEnum):
    DEV_TOOL = 'DEV_TOOL'
    CORE_DEV = 'CORE_DEV'
    COMMUNITY = 'COMMUNITY'
    DOCUMENTATION = 'DOCUMENTATION'
    ACCESSIBILITY = 'ACCESSIBILITY'


Category = CategoryEnum()


class ContributionStatusEnum(CustomEnum):
    PENDING = 'PENDING'
    CONFIRMED = 'CONFIRMED'
    DELETED = 'DELETED'


ContributionStatus = ContributionStatusEnum()


class RFPStatusEnum(CustomEnum):
    DRAFT = 'DRAFT'
    LIVE = 'LIVE'
    CLOSED = 'CLOSED'


RFPStatus = RFPStatusEnum()


class MilestoneStageEnum(CustomEnum):
    IDLE = 'IDLE'
    REQUESTED = 'REQUESTED'
    REJECTED = 'REJECTED'
    ACCEPTED = 'ACCEPTED'
    PAID = 'PAID'


MilestoneStage = MilestoneStageEnum()


class ProposalArbiterStatusEnum(CustomEnum):
    MISSING = 'MISSING'
    NOMINATED = 'NOMINATED'
    ACCEPTED = 'ACCEPTED'


ProposalArbiterStatus = ProposalArbiterStatusEnum()


class ProposalChangeEnum(CustomEnum):
    PROPOSAL_EDIT_BRIEF = 'PROPOSAL_EDIT_BRIEF'
    PROPOSAL_EDIT_CONTENT = 'PROPOSAL_EDIT_CONTENT'
    PROPOSAL_EDIT_TARGET = 'PROPOSAL_EDIT_TARGET'
    PROPOSAL_EDIT_TITLE = 'PROPOSAL_EDIT_TITLE'
    MILESTONE_ADD = 'MILESTONE_ADD'
    MILESTONE_REMOVE = 'MILESTONE_REMOVE'
    MILESTONE_EDIT_DAYS = 'MILESTONE_EDIT_DAYS'
    MILESTONE_EDIT_IMMEDIATE_PAYOUT = 'MILESTONE_EDIT_IMMEDIATE_PAYOUT'
    MILESTONE_EDIT_PERCENT = 'MILESTONE_EDIT_PERCENT'
    MILESTONE_EDIT_CONTENT = 'MILESTONE_EDIT_CONTENT'


ProposalChange = ProposalChangeEnum()

