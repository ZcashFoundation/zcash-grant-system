from enum import Enum


# Extend Enum with some helper functions
class CustomEnum(Enum):
    # Adds an .includes function that tests if a value is in enum
    def includes(enum: str):
        return enum in self.__members__


class ProposalStatus(CustomEnum):
    DRAFT = 'DRAFT'
    PENDING = 'PENDING'
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'
    LIVE = 'LIVE'
    DELETED = 'DELETED'


class ProposalStage(CustomEnum):
    FUNDING_REQUIRED = 'FUNDING_REQUIRED'
    COMPLETED = 'COMPLETED'


class Category(CustomEnum):
    DAPP = 'DAPP'
    DEV_TOOL = 'DEV_TOOL'
    CORE_DEV = 'CORE_DEV'
    COMMUNITY = 'COMMUNITY'
    DOCUMENTATION = 'DOCUMENTATION'
    ACCESSIBILITY = 'ACCESSIBILITY'


class ContributionStatus(CustomEnum):
    PENDING = 'PENDING'
    CONFIRMED = 'CONFIRMED'
    DELETED = 'DELETED'
