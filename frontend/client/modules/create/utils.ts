import { ProposalDraft, CreateMilestone } from 'types';
import { User } from 'types';
import { isValidEthAddress, getAmountError } from 'utils/validators';
import { MILESTONE_STATE, ProposalWithCrowdFund } from 'types';
import { ProposalContractData } from 'modules/web3/actions';
import { Wei, toWei } from 'utils/units';
import { ONE_DAY } from 'utils/time';
import { PROPOSAL_CATEGORY } from 'api/constants';

// TODO: Raise this limit
export const TARGET_ETH_LIMIT = 1000;

interface CreateFormErrors {
  title?: string;
  brief?: string;
  category?: string;
  target?: string;
  team?: string[];
  content?: string;
  payoutAddress?: string;
  trustees?: string[];
  milestones?: string[];
  deadlineDuration?: string;
  voteDuration?: string;
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
  trustees: 'Trustees',
  milestones: 'Milestones',
  deadlineDuration: 'Funding deadline',
  voteDuration: 'Milestone deadline',
};

const requiredFields = [
  'title',
  'brief',
  'category',
  'target',
  'content',
  'payoutAddress',
  'trustees',
  'deadlineDuration',
  'voteDuration',
];

export function getCreateErrors(
  form: Partial<ProposalDraft>,
  skipRequired?: boolean,
): CreateFormErrors {
  const errors: CreateFormErrors = {};
  const { title, team, milestones, target, payoutAddress, trustees } = form;

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
    const targetErr = getAmountError(targetFloat, TARGET_ETH_LIMIT);
    if (targetErr) {
      errors.target = targetErr;
    }
  }

  // Payout address
  if (payoutAddress && !isValidEthAddress(payoutAddress)) {
    errors.payoutAddress = 'That doesn’t look like a valid address';
  }

  // Trustees
  if (trustees) {
    let didTrusteeError = false;
    const trusteeErrors = trustees.map((address, idx) => {
      if (!address) {
        return '';
      }

      let err = '';
      if (!isValidEthAddress(address)) {
        err = 'That doesn’t look like a valid address';
      } else if (trustees.indexOf(address) !== idx) {
        err = 'That address is already a trustee';
      } else if (payoutAddress === address) {
        err = 'That address is already a trustee';
      }

      didTrusteeError = didTrusteeError || !!err;
      return err;
    });
    if (didTrusteeError) {
      errors.trustees = trusteeErrors;
    }
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
  } else if (!/.+\@.+\..+/.test(user.emailAddress)) {
    return 'That doesn’t look like a valid email address';
  } else if (!isValidEthAddress(user.accountAddress)) {
    return 'That doesn’t look like a valid ETH address';
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

function milestoneToMilestoneAmount(milestone: CreateMilestone, raiseGoal: Wei) {
  return raiseGoal.divn(100).mul(Wei(milestone.payoutPercent));
}

export function proposalToContractData(form: ProposalDraft): ProposalContractData {
  const targetInWei = toWei(form.target, 'ether');
  const milestoneAmounts = form.milestones.map(m =>
    milestoneToMilestoneAmount(m, targetInWei),
  );
  const immediateFirstMilestonePayout = form.milestones[0]!.immediatePayout;

  return {
    ethAmount: targetInWei,
    payoutAddress: form.payoutAddress,
    trusteesAddresses: form.trustees,
    milestoneAmounts,
    durationInMinutes: form.deadlineDuration || ONE_DAY * 60,
    milestoneVotingPeriodInMinutes: form.voteDuration || ONE_DAY * 7,
    immediateFirstMilestonePayout,
  };
}

// This is kind of a disgusting function, sorry.
export function makeProposalPreviewFromDraft(
  draft: ProposalDraft,
): ProposalWithCrowdFund {
  const target = parseFloat(draft.target);

  return {
    proposalId: 0,
    proposalUrlId: '0-title',
    proposalAddress: '0x0',
    dateCreated: Date.now(),
    title: draft.title,
    brief: draft.brief,
    content: draft.content,
    stage: 'preview',
    category: draft.category || PROPOSAL_CATEGORY.DAPP,
    team: draft.team,
    milestones: draft.milestones.map((m, idx) => ({
      index: idx,
      title: m.title,
      content: m.content,
      amount: toWei(target * (parseInt(m.payoutPercent, 10) / 100), 'ether'),
      amountAgainstPayout: Wei('0'),
      percentAgainstPayout: 0,
      payoutRequestVoteDeadline: Date.now(),
      dateEstimated: m.dateEstimated,
      immediatePayout: m.immediatePayout,
      isImmediatePayout: m.immediatePayout,
      isPaid: false,
      payoutPercent: m.payoutPercent.toString(),
      state: MILESTONE_STATE.WAITING,
      stage: MILESTONE_STATE.WAITING,
    })),
    crowdFund: {
      immediateFirstMilestonePayout: draft.milestones[0].immediatePayout,
      balance: Wei('0'),
      funded: Wei('0'),
      percentFunded: 0,
      target: toWei(target, 'ether'),
      amountVotingForRefund: Wei('0'),
      percentVotingForRefund: 0,
      beneficiary: draft.payoutAddress,
      trustees: draft.trustees,
      deadline: Date.now() + 100000,
      contributors: [],
      milestones: [],
      milestoneVotingPeriod: 0,
      isFrozen: false,
      isRaiseGoalReached: false,
    },
  };
}
