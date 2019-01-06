interface Email {
  id: string;
  title: string;
  description: string;
  args?: any;
}

export default [
  {
    id: 'signup',
    title: 'Signup',
    description:
      'Sent when the user first signs up, with instructions to confirm their email',
    args: {
      confirm_url: 'http://someconfirmurl.com',
    },
  },
  {
    id: 'recover',
    title: 'Password recovery',
    description: 'For recovering a user’s forgotten password',
    args: {
      confirm_url: 'http://somerecoveryurl.com',
    },
  },
  {
    id: 'team_invite',
    title: 'Proposal team invite',
    description: 'Sent when a proposal creator sends an invite to a user',
    args: {
      user: null,
      invite_url: 'http://someinviteurl.com',
    },
  },
] as Email[];
