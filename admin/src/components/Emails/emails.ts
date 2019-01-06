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
] as Email[];
