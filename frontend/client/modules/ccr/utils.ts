import { CCRDraft } from 'types';
import { getAmountErrorUsd, getAmountErrorUsdFromString } from 'utils/validators';

interface CCRFormErrors {
  title?: string;
  brief?: string;
  target?: string;
  content?: string;
}

export type KeyOfForm = keyof CCRFormErrors;
export const FIELD_NAME_MAP: { [key in KeyOfForm]: string } = {
  title: 'Title',
  brief: 'Brief',
  target: 'Target amount',
  content: 'Details',
};

const requiredFields = ['title', 'brief', 'target', 'content'];

export function getCCRErrors(
  form: Partial<CCRDraft>,
  skipRequired?: boolean,
): CCRFormErrors {
  const errors: CCRFormErrors = {};
  const { title, content, brief, target } = form;

  // Required fields with no extra validation
  if (!skipRequired) {
    for (const key of requiredFields) {
      if (!form[key as KeyOfForm]) {
        errors[key as KeyOfForm] = `${FIELD_NAME_MAP[key as KeyOfForm]} is required`;
      }
    }
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

  return errors;
}
