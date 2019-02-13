export enum PROPOSAL_SORT {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
}

export const SORT_LABELS: { [key in PROPOSAL_SORT]: string } = {
  NEWEST: 'Newest',
  OLDEST: 'Oldest',
};

export enum PROPOSAL_CATEGORY {
  DAPP = 'DAPP',
  DEV_TOOL = 'DEV_TOOL',
  CORE_DEV = 'CORE_DEV',
  COMMUNITY = 'COMMUNITY',
  DOCUMENTATION = 'DOCUMENTATION',
  ACCESSIBILITY = 'ACCESSIBILITY',
}

interface CategoryUI {
  label: string;
  color: string;
  icon: string;
}

export const CATEGORY_UI: { [key in PROPOSAL_CATEGORY]: CategoryUI } = {
  DAPP: {
    label: 'DApp',
    color: '#8e44ad',
    icon: 'appstore',
  },
  DEV_TOOL: {
    label: 'Developer tool',
    color: '#2c3e50',
    icon: 'tool',
  },
  CORE_DEV: {
    label: 'Core dev',
    color: '#d35400',
    icon: 'rocket',
  },
  COMMUNITY: {
    label: 'Community',
    color: '#27ae60',
    icon: 'team',
  },
  DOCUMENTATION: {
    label: 'Documentation',
    color: '#95a5a6',
    icon: 'paper-clip',
  },
  ACCESSIBILITY: {
    label: 'Accessibility',
    color: '#2980b9',
    icon: 'eye-o',
  },
};

export enum PROPOSAL_STAGE {
  PREVIEW = 'PREVIEW',
  FUNDING_REQUIRED = 'FUNDING_REQUIRED',
  WIP = 'WIP',
  COMPLETED = 'COMPLETED',
}

interface StageUI {
  label: string;
  color: string;
}

export const STAGE_UI: { [key in PROPOSAL_STAGE]: StageUI } = {
  PREVIEW: {
    label: 'Preview',
    color: '#8e44ad',
  },
  FUNDING_REQUIRED: {
    label: 'Funding required',
    color: '#8e44ad',
  },
  WIP: {
    label: 'In progress',
    color: '#2980b9',
  },
  COMPLETED: {
    label: 'Completed',
    color: '#27ae60',
  },
};

export enum RFP_STATUS {
  DRAFT = 'DRAFT',
  LIVE = 'LIVE',
  CLOSED = 'CLOSED',
}
