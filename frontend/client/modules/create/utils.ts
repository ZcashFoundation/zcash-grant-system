import {
  ProposalDraft,
  STATUS,
  MILESTONE_STAGE,
  PROPOSAL_ARBITER_STATUS,
  CCRDraft,
  RFP,
} from 'types';
import { User, CCR } from 'types';
import {
  getAmountErrorUsd,
  getAmountErrorUsdFromString,
  isValidSaplingAddress,
  isValidTAddress,
  isValidSproutAddress,
} from 'utils/validators';
import { toUsd } from 'utils/units';
import { PROPOSAL_STAGE, RFP_STATUS } from 'api/constants';
import {
  ProposalDetail,
  PROPOSAL_DETAIL_INITIAL_STATE,
} from 'modules/proposals/reducers';

interface CreateFormErrors {
  rfpOptIn?: string;
  title?: string;
  brief?: string;
  target?: string;
  team?: string[];
  content?: string;
  payoutAddress?: string;
  tipJarAddress?: string;
  milestones?: string[];
}

export type KeyOfForm = keyof CreateFormErrors;
export const FIELD_NAME_MAP: { [key in KeyOfForm]: string } = {
  rfpOptIn: 'KYC',
  title: 'Title',
  brief: 'Brief',
  target: 'Target amount',
  team: 'Team',
  content: 'Details',
  payoutAddress: 'Payout address',
  tipJarAddress: 'Tip address',
  milestones: 'Milestones',
};

const requiredFields = ['title', 'brief', 'target', 'content', 'payoutAddress'];

export function getCreateErrors(
  form: Partial<ProposalDraft>,
  skipRequired?: boolean,
): CreateFormErrors {
  const errors: CreateFormErrors = {};
  const {
    title,
    content,
    team,
    milestones,
    target,
    payoutAddress,
    tipJarAddress,
    rfpOptIn,
    brief,
  } = form;

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
  if (rfpOptIn === null) {
    errors.rfpOptIn = 'Please accept or decline KYC';
  }

  // Title
  if (title && title.length > 60) {
    errors.title = 'Title can only be 60 characters maximum';
  }

  // Brief
  if (brief && brief.length > 140) {
    errors.brief = 'Brief can only be 140 characters maximum';
  }

  // Content limit for our database's sake
  if (content && content.length > 250000) {
    errors.content = 'Details can only be 250,000 characters maximum';
  }

  // Amount to raise
  const targetFloat = target ? parseFloat(target) : 0;
  if (target && !Number.isNaN(targetFloat)) {
    const limit = parseFloat(process.env.PROPOSAL_TARGET_MAX as string);
    const targetErr =
      getAmountErrorUsd(targetFloat, limit) || getAmountErrorUsdFromString(target);
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

  // Tip Jar Address
  if (tipJarAddress && !isValidSaplingAddress(tipJarAddress)) {
    if (isValidSproutAddress(tipJarAddress)) {
      errors.tipJarAddress = 'Must be a Sapling address, not a Sprout address';
    } else if (isValidTAddress(tipJarAddress)) {
      errors.tipJarAddress = 'Must be a Sapling Z address, not a T address';
    } else {
      errors.tipJarAddress = 'That doesn’t look like a valid Sapling address';
    }
  }

  // Milestones
  if (milestones) {
    let cumulativeMilestonePct = 0;
    const milestoneErrors = milestones.map((ms, idx) => {
      // check payout first so we collect the cumulativePayout even if other fields are invalid
      if (!ms.payoutPercent) {
        return 'Payout percent is required';
      } else if (Number.isNaN(parseInt(ms.payoutPercent, 10))) {
        return 'Payout percent must be a valid number';
      } else if (parseInt(ms.payoutPercent, 10) !== parseFloat(ms.payoutPercent)) {
        return 'Payout percent must be a whole number, no decimals';
      } else if (parseInt(ms.payoutPercent, 10) <= 0) {
        return 'Payout percent must be greater than 0%';
      } else if (parseInt(ms.payoutPercent, 10) > 100) {
        return 'Payout percent must be less than or equal to 100%';
      }

      // Last one shows percentage errors
      cumulativeMilestonePct += parseInt(ms.payoutPercent, 10);

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

      if (!ms.immediatePayout) {
        if (!ms.daysEstimated) {
          return 'Estimate in days is required';
        } else if (Number.isNaN(parseInt(ms.daysEstimated, 10))) {
          return 'Days estimated must be a valid number';
        } else if (parseInt(ms.daysEstimated, 10) !== parseFloat(ms.daysEstimated)) {
          return 'Days estimated must be a whole number, no decimals';
        } else if (parseInt(ms.daysEstimated, 10) <= 0) {
          return 'Days estimated must be greater than 0';
        } else if (parseInt(ms.daysEstimated, 10) > 365) {
          return 'Days estimated must be less than or equal to 365';
        }
      }

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
  if (user.displayName.length > 50) {
    return 'Display name can only be 50 characters maximum';
  } else if (user.title.length > 50) {
    return 'Title can only be 50 characters maximum';
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
    target: toUsd(draft.target),
    funded: toUsd('0'),
    contributionMatching: 0,
    contributionBounty: toUsd('0'),
    percentFunded: 0,
    stage: PROPOSAL_STAGE.PREVIEW,
    isStaked: true,
    arbiter: {
      status: PROPOSAL_ARBITER_STATUS.ACCEPTED,
    },
    tipJarAddress: null,
    tipJarViewKey: null,
    acceptedWithFunding: false,
    authedFollows: false,
    followersCount: 0,
    authedLiked: false,
    likesCount: 0,
    isVersionTwo: true,
    milestones: draft.milestones.map((m, idx) => ({
      id: idx,
      index: idx,
      title: m.title,
      content: m.content,
      amount: (target * (parseInt(m.payoutPercent, 10) / 100)).toFixed(2),
      daysEstimated: m.daysEstimated,
      immediatePayout: m.immediatePayout,
      payoutPercent: m.payoutPercent.toString(),
      stage: MILESTONE_STAGE.IDLE,
    })),
    ...PROPOSAL_DETAIL_INITIAL_STATE,
  };
}

export function makeRfpPreviewFromCcrDraft(draft: CCRDraft): RFP {
  const ccr: CCR = {
    ...draft,
  };
  const now = new Date().getTime();
  const { brief, content, title } = draft;

  return {
    id: 0,
    urlId: '',
    status: RFP_STATUS.LIVE,
    acceptedProposals: [],
    bounty: draft.target ? toUsd(draft.target) : null,
    matching: false,
    dateOpened: now / 1000,
    authedLiked: false,
    likesCount: 0,
    isVersionTwo: true,
    ccr,
    brief,
    content,
    title,
  };
}
