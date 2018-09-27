import { CreateFormState, Milestone, TeamMember } from './types';
import { isValidEthAddress, getAmountError } from 'utils/validators';
import { ProposalWithCrowdFund } from 'modules/proposals/reducers';
import { MILESTONE_STATE } from 'modules/proposals/reducers';
import { ProposalContractData, ProposalBackendData } from 'modules/web3/actions';
import { Wei, toWei } from 'utils/units';

// TODO: Raise this limit
export const TARGET_ETH_LIMIT = 10;

interface CreateFormErrors {
  title?: string;
  brief?: string;
  category?: string;
  amountToRaise?: string;
  team?: string[];
  details?: string;
  payOutAddress?: string;
  trustees?: string[];
  milestones?: string[];
  deadline?: string;
  milestoneDeadline?: string;
}

export type KeyOfForm = keyof CreateFormState;
export const FIELD_NAME_MAP: { [key in KeyOfForm]: string } = {
  title: 'Title',
  brief: 'Brief',
  category: 'Category',
  amountToRaise: 'Target amount',
  team: 'Team',
  details: 'Details',
  payOutAddress: 'Payout address',
  trustees: 'Trustees',
  milestones: 'Milestones',
  deadline: 'Funding deadline',
  milestoneDeadline: 'Milestone deadline',
};

export function getCreateErrors(
  form: Partial<CreateFormState>,
  skipRequired?: boolean,
): CreateFormErrors {
  const errors: CreateFormErrors = {};
  const { title, team, milestones, amountToRaise, payOutAddress, trustees } = form;

  // Required fields with no extra validation
  if (!skipRequired) {
    Object.entries(form).forEach((item: [KeyOfForm, any]) => {
      if (!item[1]) {
        errors[item[0]] = `${FIELD_NAME_MAP[item[0]]} is required`;
      }
    });

    if (!milestones || !milestones.length) {
      errors.milestones = ['Must have at least one milestone'];
    }
    if (!team || !team.length) {
      errors.team = ['Must have at least one team member'];
    }
  }

  // Title
  if (title.length > 60) {
    errors.title = 'Title can only be 60 characters maximum';
  }

  // Amount to raise
  const amountFloat = parseFloat(amountToRaise);
  if (amountToRaise && !Number.isNaN(amountFloat)) {
    const amountError = getAmountError(amountFloat, TARGET_ETH_LIMIT);
    if (amountError) {
      errors.amountToRaise = amountError;
    }
  }

  // Payout address
  if (payOutAddress && !isValidEthAddress(payOutAddress)) {
    errors.payOutAddress = 'That doesn’t look like a valid address';
  }

  // Trustees
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
    } else if (payOutAddress === address) {
      err = 'That address is already a trustee';
    }

    didTrusteeError = didTrusteeError || !!err;
    return err;
  });
  if (didTrusteeError) {
    errors.trustees = trusteeErrors;
  }

  // Milestones
  let didMilestoneError = false;
  let cumulativeMilestonePct = 0;
  const milestoneErrors = milestones.map((ms, idx) => {
    if (!ms.title || !ms.description || !ms.date || !ms.payoutPercent) {
      didMilestoneError = true;
      return '';
    }

    let err = '';
    if (ms.title.length > 40) {
      err = 'Title length can only be 40 characters maximum';
    } else if (ms.description.length > 200) {
      err = 'Description can only be 200 characters maximum';
    }

    // Last one shows percentage errors
    cumulativeMilestonePct += ms.payoutPercent;
    if (idx === milestones.length - 1 && cumulativeMilestonePct !== 100) {
      err = `Payout percentages doesn’t add up to 100% (currently ${cumulativeMilestonePct}%)`;
    }

    didMilestoneError = didMilestoneError || !!err;
    return err;
  });
  if (didMilestoneError) {
    errors.milestones = milestoneErrors;
  }

  // Team
  let didTeamError = false;
  const teamErrors = team.map(u => {
    if (!u.name || !u.title || !u.emailAddress || !u.ethAddress) {
      didTeamError = true;
      return '';
    }

    const err = getCreateTeamMemberError(u);
    didTeamError = didTeamError || !!err;
    return err;
  });
  if (didTeamError) {
    errors.team = teamErrors;
  }

  return errors;
}

export function getCreateTeamMemberError(user: TeamMember) {
  if (user.name.length > 30) {
    return 'Display name can only be 30 characters maximum';
  } else if (user.title.length > 30) {
    return 'Title can only be 30 characters maximum';
  } else if (!/.+\@.+\..+/.test(user.emailAddress)) {
    return 'That doesn’t look like a valid email address';
  } else if (!isValidEthAddress(user.ethAddress)) {
    return 'That doesn’t look like a valid ETH address';
  }

  return '';
}

function milestoneToMilestoneAmount(milestone: Milestone, raiseGoal: Wei) {
  return raiseGoal.divn(100).mul(Wei(milestone.payoutPercent.toString()));
}

export function formToContractData(form: CreateFormState): ProposalContractData {
  const targetInWei = toWei(form.amountToRaise, 'ether');
  const milestoneAmounts = form.milestones.map(m =>
    milestoneToMilestoneAmount(m, targetInWei),
  );
  const immediateFirstMilestonePayout = form.milestones[0].immediatePayout;

  return {
    ethAmount: targetInWei,
    payOutAddress: form.payOutAddress,
    trusteesAddresses: form.trustees,
    milestoneAmounts,
    milestones: form.milestones,
    durationInMinutes: form.deadline,
    milestoneVotingPeriodInMinutes: form.milestoneDeadline,
    immediateFirstMilestonePayout,
  };
}

export function formToBackendData(form: CreateFormState): ProposalBackendData {
  return {
    title: form.title,
    category: form.category,
    content: form.details,
    team: form.team,
  };
}

// This is kind of a disgusting function, sorry.
export function makeProposalPreviewFromForm(
  form: CreateFormState,
): ProposalWithCrowdFund {
  const target = parseFloat(form.amountToRaise);

  return {
    proposalId: 'preview',
    dateCreated: Date.now(),
    title: form.title,
    body: form.details,
    stage: 'preview',
    category: form.category,
    team: form.team,
    milestones: form.milestones.map((m, idx) => ({
      index: idx,
      title: m.title,
      body: m.description,
      content: m.description,
      amount: toWei(target * (m.payoutPercent / 100), 'ether'),
      amountAgainstPayout: Wei('0'),
      percentAgainstPayout: 0,
      payoutRequestVoteDeadline: Date.now(),
      dateEstimated: m.date,
      immediatePayout: m.immediatePayout,
      isImmediatePayout: m.immediatePayout,
      isPaid: false,
      payoutPercent: m.payoutPercent.toString(),
      state: MILESTONE_STATE.WAITING,
      stage: MILESTONE_STATE.WAITING,
    })),
    crowdFund: {
      immediateFirstMilestonePayout: form.milestones[0].immediatePayout,
      balance: Wei('0'),
      funded: Wei('0'),
      percentFunded: 0,
      target: toWei(target, 'ether'),
      amountVotingForRefund: Wei('0'),
      percentVotingForRefund: 0,
      beneficiary: form.payOutAddress,
      trustees: form.trustees,
      deadline: Date.now() + 100000,
      contributors: [],
      milestones: [],
      milestoneVotingPeriod: 0,
      isFrozen: false,
      isRaiseGoalReached: false,
    },
    crowdFundContract: null,
  };
}
