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
    id: 'change_email_old',
    title: 'Change email notification (Old email)',
    description: 'Sent when the user has changed their email, in case of compromise',
  },
  {
    id: 'change_password',
    title: 'Change password confirmation',
    description: 'Sent when the user has changed their password, in case of compromise',
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
    id: 'proposal_failed',
    title: 'Proposal failed',
    description:
      'Sent to the proposal team when the deadline is reached and it didn’t get fully funded',
  },
  {
    id: 'proposal_canceled',
    title: 'Proposal canceled',
    description:
      'Sent to the proposal team when an admin cancels the proposal after funding',
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
    id: 'contribution_refunded',
    title: 'Contribution refunded',
    description: 'Sent when an admin refunds a contribution',
  },
  {
    id: 'contribution_proposal_failed',
    title: 'Contribution proposal failed',
    description:
      'Sent to contributors when the deadline is reached and the proposal didn’t get fully funded',
  },
  {
    id: 'contribution_proposal_canceled',
    title: 'Contribution proposal canceled',
    description: 'Sent to contributors when an admin cancels the proposal after funding',
  },
  {
    id: 'contribution_expired',
    title: 'Contribution expired',
    description: 'Sent 24 hours after a contribution is made with no confirmation',
  },
  {
    id: 'comment_reply',
    title: 'Comment reply',
    description: 'Sent if someone makes a direct reply to your comment',
  },
  {
    id: 'proposal_arbiter',
    title: 'Arbiter assignment',
    description: 'Sent if someone is made arbiter of a proposal',
  },
  {
    id: 'milestone_request',
    title: 'Milestone request',
    description: 'Sent if team member has made a milestone payout request',
  },
  {
    id: 'milestone_accept',
    title: 'Milestone accept',
    description: 'Sent if arbiter approves milestone payout',
  },
  {
    id: 'milestone_reject',
    title: 'Milestone reject',
    description: 'Sent if arbiter rejects milestone payout',
  },
  {
    id: 'milestone_paid',
    title: 'Milestone paid',
    description: 'Sent when milestone is paid',
  },
  {
    id: 'admin_approval',
    title: 'Admin Approval',
    description: 'Sent when proposal is ready for review',
  },
  {
    id: 'admin_arbiter',
    title: 'Admin Arbiter',
    description: 'Sent when proposal is ready to have an arbiter nominated',
  },
  {
    id: 'admin_payout',
    title: 'Admin Payout',
    description: 'Sent when milestone payout has been approved',
  },
  {
    id: 'followed_proposal_milestone',
    title: 'Followed Proposal Milestone',
    description:
      'Sent to followers of a proposal when one of its milestones has been approved',
  },
  {
    id: 'followed_proposal_update',
    title: 'Followed Proposal Update',
    description: 'Sent to followers of a proposal when it has a new update',
  },
] as Email[];
