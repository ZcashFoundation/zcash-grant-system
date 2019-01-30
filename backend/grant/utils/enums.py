# Our own Enum class with custom functionality, not Python's
class CustomEnum():
    # Adds an .includes function that tests if a value is in enum
    def includes(self, enum: str):
        return hasattr(self, enum)


class ProposalStatusEnum(CustomEnum):
    DRAFT = 'DRAFT'
    PENDING = 'PENDING'
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'
    LIVE = 'LIVE'
    DELETED = 'DELETED'
ProposalStatus = ProposalStatusEnum()


class ProposalStageEnum(CustomEnum):
    FUNDING_REQUIRED = 'FUNDING_REQUIRED'
    COMPLETED = 'COMPLETED'
ProposalStage = ProposalStageEnum()


class CategoryEnum(CustomEnum):
    DAPP = 'DAPP'
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
