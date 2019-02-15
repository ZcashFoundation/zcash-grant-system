import { PROPOSAL_CATEGORY } from 'types';

interface EnumUI {
  label: string;
  color: string;
}

interface EnumUIWithIcon extends EnumUI {
  icon: string;
}

export const CATEGORY_UI: { [key in PROPOSAL_CATEGORY]: EnumUIWithIcon } = {
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
