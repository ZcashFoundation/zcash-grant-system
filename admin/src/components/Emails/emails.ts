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
    id: 'contribution_confirmed',
    title: 'Contribution confirmed',
    description: 'Sent after a contribution can be confirmed on chain',
  },
] as Email[];
