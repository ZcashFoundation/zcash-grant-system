import React from 'react';
import { Link } from 'react-router-dom';
import { UserCCR } from 'types';
import UserRow from 'components/UserRow';
import './ProfileCCR.less';

interface OwnProps {
  ccr: UserCCR;
}

export default class ProfileCCR extends React.Component<OwnProps> {
  render() {
    const { title, brief, ccrId, author } = this.props.ccr;
    return (
      <div className="ProfileCCR">
        <div className="ProfileCCR-block">
          <Link to={`/ccrs/${ccrId}`} className="ProfileCCR-title">
            {title}
          </Link>
          <div className="ProfileCCR-brief">{brief}</div>
        </div>
        <div className="ProfileCCR-block">
          <h3>Author</h3>
          <div className="ProfileCCR-block-team">
            <UserRow key={author.userid} user={author} />
          </div>
        </div>
      </div>
    );
  }
}
