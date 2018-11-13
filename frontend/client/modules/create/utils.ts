import { CreateFormState, CreateMilestone } from 'types';
import { TeamMember } from 'types';
import { isValidEthAddress, getAmountError } from 'utils/validators';
import { MILESTONE_STATE, ProposalWithCrowdFund } from 'types';
import { ProposalContractData, ProposalBackendData } from 'modules/web3/actions';
import { Wei, toWei } from 'utils/units';
import { ONE_DAY } from 'utils/time';
import { PROPOSAL_CATEGORY } from 'api/constants';

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
    for (const key in form) {
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
  const amountFloat = amountToRaise ? parseFloat(amountToRaise) : 0;
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
      } else if (payOutAddress === address) {
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
  }

  // Team
  if (team) {
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

function milestoneToMilestoneAmount(milestone: CreateMilestone, raiseGoal: Wei) {
  return raiseGoal.divn(100).mul(Wei(milestone.payoutPercent.toString()));
}

export function formToContractData(form: CreateFormState): ProposalContractData {
  const targetInWei = toWei(form.amountToRaise, 'ether');
  const milestoneAmounts = form.milestones.map(m =>
    milestoneToMilestoneAmount(m, targetInWei),
  );
  const immediateFirstMilestonePayout = form.milestones[0]!.immediatePayout;

  return {
    ethAmount: targetInWei,
    payOutAddress: form.payOutAddress,
    trusteesAddresses: form.trustees,
    milestoneAmounts,
    milestones: form.milestones,
    durationInMinutes: form.deadline || ONE_DAY * 60,
    milestoneVotingPeriodInMinutes: form.milestoneDeadline || ONE_DAY * 7,
    immediateFirstMilestonePayout,
  };
}

export function formToBackendData(form: CreateFormState): ProposalBackendData {
  return {
    title: form.title,
    category: form.category as PROPOSAL_CATEGORY,
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
    proposalId: 0,
    proposalUrlId: '0-title',
    proposalAddress: '0x0',
    dateCreated: Date.now(),
    title: form.title,
    body: form.details,
    stage: 'preview',
    category: form.category || PROPOSAL_CATEGORY.DAPP,
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
