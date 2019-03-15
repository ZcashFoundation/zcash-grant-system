import {
  ProposalDraft,
  CreateMilestone,
  STATUS,
  MILESTONE_STAGE,
  PROPOSAL_ARBITER_STATUS,
} from 'types';
import { User } from 'types';
import {
  getAmountError,
  isValidSaplingAddress,
  isValidTAddress,
  isValidSproutAddress,
} from 'utils/validators';
import { Zat, toZat } from 'utils/units';
import { ONE_DAY } from 'utils/time';
import { PROPOSAL_CATEGORY, PROPOSAL_STAGE } from 'api/constants';
import {
  ProposalDetail,
  PROPOSAL_DETAIL_INITIAL_STATE,
} from 'modules/proposals/reducers';

export const TARGET_ZEC_LIMIT = 1000;

interface CreateFormErrors {
  rfpOptIn?: string;
  title?: string;
  brief?: string;
  category?: string;
  target?: string;
  team?: string[];
  content?: string;
  payoutAddress?: string;
  milestones?: string[];
  deadlineDuration?: string;
}

export type KeyOfForm = keyof CreateFormErrors;
export const FIELD_NAME_MAP: { [key in KeyOfForm]: string } = {
  rfpOptIn: 'RFP KYC',
  title: 'Title',
  brief: 'Brief',
  category: 'Category',
  target: 'Target amount',
  team: 'Team',
  content: 'Details',
  payoutAddress: 'Payout address',
  milestones: 'Milestones',
  deadlineDuration: 'Funding deadline',
};

const requiredFields = [
  'title',
  'brief',
  'category',
  'target',
  'content',
  'payoutAddress',
  'deadlineDuration',
];

export function getCreateErrors(
  form: Partial<ProposalDraft>,
  skipRequired?: boolean,
): CreateFormErrors {
  const errors: CreateFormErrors = {};
  const { title, team, milestones, target, payoutAddress, rfp, rfpOptIn } = form;

  // Required fields with no extra validation
  if (!skipRequired) {
    for (const key of requiredFields) {
      if (!form[key as KeyOfForm]) {
        errors[key as KeyOfForm] = `${FIELD_NAME_MAP[key as KeyOfForm]} is required`;
      }
    }

    if (!milestones || !milestones.length) {
      errors.milestones = ['Must have at least one milestone'];
    }
    if (!team || !team.length) {
      errors.team = ['Must have at least one team member'];
    }
  }

  // RFP opt-in
  if (rfp && (rfp.bounty || rfp.matching) && rfpOptIn === null) {
    errors.rfpOptIn = 'Please accept or decline KYC';
  }

  // Title
  if (title && title.length > 60) {
    errors.title = 'Title can only be 60 characters maximum';
  }

  // Amount to raise
  const targetFloat = target ? parseFloat(target) : 0;
  if (target && !Number.isNaN(targetFloat)) {
    const targetErr = getAmountError(targetFloat, TARGET_ZEC_LIMIT);
    if (targetErr) {
      errors.target = targetErr;
    }
  }

  // Payout address
  if (payoutAddress && !isValidSaplingAddress(payoutAddress)) {
    if (isValidSproutAddress(payoutAddress)) {
      errors.payoutAddress = 'Must be a Sapling address, not a Sprout address';
    } else if (isValidTAddress(payoutAddress)) {
      errors.payoutAddress = 'Must be a Sapling Z address, not a T address';
    } else {
      errors.payoutAddress = 'That doesn’t look like a valid Sapling address';
    }
  }

  // Milestones
  if (milestones) {
    let cumulativeMilestonePct = 0;
    const milestoneErrors = milestones.map((ms, idx) => {
      if (!ms.title) {
        return 'Title is required';
      } else if (ms.title.length > 40) {
        return 'Title length can only be 40 characters maximum';
      }

      if (!ms.content) {
        return 'Description is required';
      } else if (ms.content.length > 200) {
        return 'Description can only be 200 characters maximum';
      }

      if (!ms.dateEstimated) {
        return 'Estimate date is required';
      }

      if (!ms.payoutPercent) {
        return 'Payout percent is required';
      } else if (Number.isNaN(parseInt(ms.payoutPercent, 10))) {
        return 'Payout percent must be a valid number';
      }

      // Last one shows percentage errors
      cumulativeMilestonePct += parseInt(ms.payoutPercent, 10);
      if (
        idx === milestones.length - 1 &&
        cumulativeMilestonePct !== 100 &&
        !Number.isNaN(cumulativeMilestonePct)
      ) {
        return `Payout percentages don’t add up to 100% (currently ${cumulativeMilestonePct}%)`;
      }
      return '';
    });
    if (milestoneErrors.find(err => !!err)) {
      errors.milestones = milestoneErrors;
    }
  }
  return errors;
}

export function validateUserProfile(user: User) {
  if (user.displayName.length > 30) {
    return 'Display name can only be 30 characters maximum';
  } else if (user.title.length > 30) {
    return 'Title can only be 30 characters maximum';
  }

  return '';
}

export function getCreateWarnings(form: Partial<ProposalDraft>): string[] {
  const warnings = [];

  // Warn about pending invites
  const hasPending =
    (form.invites || []).filter(inv => inv.accepted === null).length !== 0;
  if (hasPending) {
    warnings.push(`
      You still have pending team invitations. If you publish before they
      are accepted, your team will be locked in and they won’t be able to
      join.
    `);
  }

  return warnings;
}

function milestoneToMilestoneAmount(milestone: CreateMilestone, raiseGoal: Zat) {
  return raiseGoal.divn(100).mul(Zat(milestone.payoutPercent));
}

export function proposalToContractData(form: ProposalDraft): any {
  const targetInZat = toZat(form.target);
  const milestoneAmounts = form.milestones.map(m =>
    milestoneToMilestoneAmount(m, targetInZat),
  );
  const immediateFirstMilestonePayout = form.milestones[0]!.immediatePayout;

  return {
    ethAmount: targetInZat,
    payoutAddress: form.payoutAddress,
    trusteesAddresses: [],
    milestoneAmounts,
    durationInMinutes: form.deadlineDuration || ONE_DAY * 60,
    milestoneVotingPeriodInMinutes: ONE_DAY * 7,
    immediateFirstMilestonePayout,
  };
}

// This is kind of a disgusting function, sorry.
export function makeProposalPreviewFromDraft(draft: ProposalDraft): ProposalDetail {
  const { invites, ...rest } = draft;
  const target = parseFloat(draft.target);

  return {
    ...rest,
    proposalId: 0,
    status: STATUS.DRAFT,
    proposalUrlId: '0-title',
    proposalAddress: '0x0',
    payoutAddress: '0x0',
    dateCreated: Date.now() / 1000,
    datePublished: Date.now() / 1000,
    dateApproved: Date.now() / 1000,
    deadlineDuration: 86400 * 60,
    target: toZat(draft.target),
    funded: Zat('0'),
    contributionMatching: 0,
    contributionBounty: Zat('0'),
    percentFunded: 0,
    stage: PROPOSAL_STAGE.PREVIEW,
    category: draft.category || PROPOSAL_CATEGORY.CORE_DEV,
    isStaked: true,
    arbiter: {
      status: PROPOSAL_ARBITER_STATUS.ACCEPTED,
    },
    milestones: draft.milestones.map((m, idx) => ({
      id: idx,
      index: idx,
      title: m.title,
      content: m.content,
      amount: toZat(target * (parseInt(m.payoutPercent, 10) / 100)),
      dateEstimated: m.dateEstimated,
      immediatePayout: m.immediatePayout,
      payoutPercent: m.payoutPercent.toString(),
      stage: MILESTONE_STAGE.IDLE,
    })),
    ...PROPOSAL_DETAIL_INITIAL_STATE,
  };
}
