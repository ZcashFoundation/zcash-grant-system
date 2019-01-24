interface Email {
  id: string;
  title: string;
  description: string;
}

export default [
  {
    id: 'signup',
    title: 'Signup',
    description:
      'Sent when the user first signs up, with instructions to confirm their email',
  },
  {
    id: 'recover',
    title: 'Password recovery',
    description: 'For recovering a user’s forgotten password',
  },
  {
    id: 'change_email',
    title: 'Change email confirmation',
    description: 'Sent when the user has changed their email, to confirm their new one',
  },
  {
    id: 'team_invite',
    title: 'Proposal team invite',
    description: 'Sent when a proposal creator sends an invite to a user',
  },
  {
    id: 'proposal_approved',
    title: 'Proposal approved',
    description: 'Sent when an admin approves your submitted proposal',
  },
  {
    id: 'proposal_rejected',
    title: 'Proposal rejected',
    description: 'Sent when an admin rejects your submitted proposal',
  },
  {
    id: 'proposal_contribution',
    title: 'Proposal received contribution',
    description: 'Sent when an a user contributes and it’s been confirmed on-chain',
  },
  {
    id: 'proposal_comment',
    title: 'Proposal comment',
    description:
      'Sent if someone makes a top-level comment on your proposal. Replies don’t send an email.',
  },
  {
    id: 'contribution_confirmed',
    title: 'Contribution confirmed',
    description: 'Sent after a contribution can be confirmed on chain',
  },
  {
    id: 'contribution_update',
    title: 'Contributed proposal update',
    description: 'Sent when a proposal you contributed to posts an update',
  },
  {
    id: 'comment_reply',
    title: 'Comment reply',
    description: 'Sent if someone makes a direct reply to your comment',
  },
] as Email[];
