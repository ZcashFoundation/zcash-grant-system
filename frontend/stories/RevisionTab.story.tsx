import * as React from 'react';
import { storiesOf } from '@storybook/react';
import moment from 'moment';
import { List, Skeleton, Icon } from 'antd';

type MilestoneLogTypes =
  | 'MILESTONE_ADD'
  | 'MILESTONE_REMOVE'
  | 'MILESTONE_EDIT_AMOUNT'
  | 'MILESTONE_EDIT_PERCENT'
  | 'MILESTONE_EDIT_IMMEDIATE_PAYOUT'
  | 'MILESTONE_EDIT_DAYS';

type ProposalLogTypes =
  | 'PROPOSAL_EDIT_TITLE'
  | 'PROPOSAL_EDIT_TARGET'
  | 'PROPOSAL_EDIT_BRIEF'
  | 'PROPOSAL_EDIT_CONTENT';

type LogTypes = MilestoneLogTypes | ProposalLogTypes;

interface Log {
  author: string;
  timestamp: Date;
  type: LogTypes;
  oldState: string;
  newState: string;
  msIndex?: string;
}

interface Props {
  log: Log[];
}

const minute = 1000 * 60;
const hour = minute * 60;
const day = 24 * hour;
const week = day * 7;

const now = Date.now();

const oneWeekAgo = now - week;
const twoDaysAgo = now - 2 * day;
const oneHourAgo = now - hour;

const log: Log[] = [
  {
    author: 'User A',
    timestamp: new Date(oneWeekAgo),
    type: 'PROPOSAL_EDIT_BRIEF',
    oldState: 'test',
    newState: 'test!',
  },
  {
    author: 'User A',
    timestamp: new Date(twoDaysAgo),
    type: 'MILESTONE_ADD',
    oldState: '',
    newState: '',
    msIndex: '2',
  },
  {
    author: 'User A',
    timestamp: new Date(twoDaysAgo),
    type: 'MILESTONE_EDIT_AMOUNT',
    oldState: '',
    newState: '100',
    msIndex: '2',
  },
  {
    author: 'User A',
    timestamp: new Date(twoDaysAgo),
    type: 'MILESTONE_EDIT_PERCENT',
    oldState: '',
    newState: '20',
    msIndex: '2',
  },
  {
    author: 'User A',
    timestamp: new Date(twoDaysAgo),
    type: 'MILESTONE_EDIT_DAYS',
    oldState: '',
    newState: '30',
    msIndex: '2',
  },
  {
    author: 'User A',
    timestamp: new Date(oneHourAgo),
    type: 'PROPOSAL_EDIT_TITLE',
    oldState: 'This is the first title',
    newState: 'This is the second title',
  },
  {
    author: 'User A',
    timestamp: new Date(),
    type: 'MILESTONE_REMOVE',
    oldState: '',
    newState: '',
    msIndex: '3',
  },
];

class RevisionTab extends React.Component<Props> {
  render() {
    const contentRenderers: { [type in LogTypes]: (event: Log) => any } = {
      MILESTONE_ADD: this.renderMilestoneAdd,
      MILESTONE_EDIT_AMOUNT: this.renderMilestoneEditAmount,
      MILESTONE_EDIT_DAYS: this.renderMilestoneEditDays,
      MILESTONE_EDIT_IMMEDIATE_PAYOUT: this.renderMilestoneEditImmediatePayout,
      MILESTONE_EDIT_PERCENT: this.renderMilestoneEditPercent,
      MILESTONE_REMOVE: this.renderMilestoneRemove,
      PROPOSAL_EDIT_BRIEF: this.renderProposalEditBrief,
      PROPOSAL_EDIT_CONTENT: this.renderProposalEditContent,
      PROPOSAL_EDIT_TARGET: this.renderProposalEditTarget,
      PROPOSAL_EDIT_TITLE: this.renderProposalEditTitle,
    };

    const renderLogItem = (event: Log) => {
      return (
        <List.Item actions={[<a key="list-loadmore-more">more</a>]}>
          <Skeleton avatar title={false} loading={false} active>
            <div style={{ display: 'flex', flexDirection: 'row', flexGrow: 1 }}>
              <div style={{ opacity: 0.5, paddingRight: '1rem' }}>
                {renderIcon(event.type)}
              </div>
              <div>{contentRenderers[event.type](event)}</div>
              <div style={{ opacity: 0.5, flexGrow: 1, textAlign: 'right' }}>
                {moment(event.timestamp).fromNow()}
              </div>
            </div>
          </Skeleton>
        </List.Item>
      );
    };

    return (
      <div>
        <List
          header={<div>Revison History</div>}
          bordered
          dataSource={this.props.log}
          renderItem={renderLogItem}
        />
      </div>
    );
  }

  private renderMilestoneAdd = (event: Log) => {
    if (!event.msIndex) return;
    const msIndex = parseInt(event.msIndex, 10) + 1;
    return `Milestone ${msIndex} created`;
  };

  private renderMilestoneEditAmount = (event: Log) => {
    if (!event.msIndex) return;
    const msIndex = parseInt(event.msIndex, 10) + 1;
    const setOrEdited = event.oldState ? 'edited' : 'set';
    return `Milestone ${msIndex} amount ${setOrEdited}`;
  };

  private renderMilestoneEditDays = (event: Log) => {
    if (!event.msIndex) return;
    const msIndex = parseInt(event.msIndex, 10) + 1;
    const setOrEdited = event.oldState ? 'edited' : 'set';
    return `Milestone ${msIndex} days ${setOrEdited}`;
  };

  private renderMilestoneEditImmediatePayout = (event: Log) => {
    if (!event.msIndex) return;
    const msIndex = parseInt(event.msIndex, 10) + 1;
    const setOrUnset = event.newState === 'true' ? 'set' : 'unset';
    return `Milestone ${msIndex} immediate payout ${setOrUnset}`;
  };

  private renderMilestoneEditPercent = (event: Log) => {
    if (!event.msIndex) return;
    const msIndex = parseInt(event.msIndex, 10) + 1;
    const setOrEdited = event.oldState ? 'edited' : 'set';
    return `Milestone ${msIndex} payout percent ${setOrEdited}`;
  };

  private renderMilestoneRemove = (event: Log) => {
    if (!event.msIndex) return;
    const msIndex = parseInt(event.msIndex, 10) + 1;
    return `Milestone ${msIndex} removed`;
  };

  private renderProposalEditBrief = () => {
    return `Proposal brief edited`;
  };

  private renderProposalEditContent = () => {
    return `Proposal details edited`;
  };

  private renderProposalEditTarget = () => {
    return `Proposal target amount edited`;
  };

  private renderProposalEditTitle = () => {
    return `Proposal title edited`;
  };
}

const renderIcon = (eventType: LogTypes) => {
  if (eventType === 'MILESTONE_ADD') {
    return <Icon type="plus" />;
  } else if (eventType === 'MILESTONE_REMOVE') {
    return <Icon type="minus" />;
  } else {
    return <Icon type="edit" />;
  }
};

storiesOf('RevisionTab', module).add('basic', () => <RevisionTab log={log} />);
