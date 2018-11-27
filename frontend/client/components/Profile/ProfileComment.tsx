import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { UserComment } from 'types';
import './ProfileComment.less';

interface OwnProps {
  comment: UserComment;
  userName: string;
}

export default class Profile extends React.Component<OwnProps> {
  render() {
    const {
      userName,
      comment: { content, proposal, dateCreated },
    } = this.props;

    return (
      <div className="ProfileComment">
        <div className="ProfileComment-head">
          <span className="ProfileComment-head-name">{userName}</span> commented on{' '}
          <Link
            to={`/proposals/${proposal.proposalId}`}
            className="ProfileComment-head-proposal"
          >
            {proposal.title}
          </Link>{' '}
          {moment(dateCreated).from(Date.now())}
        </div>
        <div className="ProfileComment-body">{content}</div>
      </div>
    );
  }
}
