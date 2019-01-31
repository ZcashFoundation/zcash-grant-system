import { ProposalDraft, CreateMilestone, STATUS } from 'types';
import { User } from 'types';
import { getAmountError } from 'utils/validators';
import { MILESTONE_STATE, Proposal } from 'types';
import { Zat, toZat } from 'utils/units';
import { ONE_DAY } from 'utils/time';
import { PROPOSAL_CATEGORY } from 'api/constants';

export const TARGET_ZEC_LIMIT = 1000;

interface CreateFormErrors {
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
  const { title, team, milestones, target, payoutAddress } = form;

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
  if (!payoutAddress) {
    errors.payoutAddress = 'That doesn’t look like a valid address';
  }

  // Milestones
  if (milestones) {
    let didMilestoneError = false;
    let cumulativeMilestonePct = 0;
    const milestoneErrors = milestones.map((ms, idx) => {
      if (!ms.title || !ms.content || !ms.dateEstimated || !ms.payoutPercent) {
        didMilestoneError = true;
        return '';
      }

      let err = '';
      if (ms.title.length > 40) {
        err = 'Title length can only be 40 characters maximum';
      } else if (ms.content.length > 200) {
        err = 'Description can only be 200 characters maximum';
      }

      // Last one shows percentage errors
      cumulativeMilestonePct += parseInt(ms.payoutPercent, 10);
      if (idx === milestones.length - 1 && cumulativeMilestonePct !== 100) {
        err = `Payout percentages doesn’t add up to 100% (currently ${cumulativeMilestonePct}%)`;
      }

      didMilestoneError = didMilestoneError || !!err;
      return err;
    });
    if (didMilestoneError) {
      errors.milestones = milestoneErrors;
    }
  }
  return errors;
}

export function getCreateTeamMemberError(user: User) {
  if (user.displayName.length > 30) {
    return 'Display name can only be 30 characters maximum';
  } else if (user.title.length > 30) {
    return 'Title can only be 30 characters maximum';
  } else if (!user.emailAddress || !/.+\@.+\..+/.test(user.emailAddress)) {
    return 'That doesn’t look like a valid email address';
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
      accept join.
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
export function makeProposalPreviewFromDraft(draft: ProposalDraft): Proposal {
  const { invites, ...rest } = draft;
  const target = parseFloat(draft.target);

  return {
    ...rest,
    proposalId: 0,
    status: STATUS.DRAFT,
    proposalUrlId: '0-title',
    proposalAddress: '0x0',
    payoutAddress: '0x0',
    dateCreated: Date.now(),
    datePublished: Date.now(),
    deadlineDuration: 86400 * 60,
    target: toZat(draft.target),
    funded: Zat('0'),
    contributionMatching: 0,
    percentFunded: 0,
    stage: 'preview',
    category: draft.category || PROPOSAL_CATEGORY.DAPP,
    milestones: draft.milestones.map((m, idx) => ({
      index: idx,
      title: m.title,
      content: m.content,
      amount: toZat(target * (parseInt(m.payoutPercent, 10) / 100)),
      dateEstimated: m.dateEstimated,
      immediatePayout: m.immediatePayout,
      isImmediatePayout: m.immediatePayout,
      isPaid: false,
      payoutPercent: m.payoutPercent.toString(),
      state: MILESTONE_STATE.WAITING,
    })),
  };
}
