import React from 'react';
import moment from 'moment';
import { Icon } from 'antd';
import { Update } from 'types';
import Markdown from 'components/Markdown';
import './FullUpdate.less';

interface Props {
  update: Update;
  goBack(): void;
}

export default class FullUpdate extends React.Component<Props> {
  render() {
    const { update, goBack } = this.props;

    return (
      <div className="FullUpdate">
        <a className="FullUpdate-back" onClick={goBack}>
          <Icon type="arrow-left" /> Back to Updates
        </a>
        <h2 className="FullUpdate-title">{update.title}</h2>
        <div className="FullUpdate-date">
          {moment(update.dateCreated * 1000).format('MMMM Do, YYYY')}
        </div>
        <Markdown source={update.content} className="FullUpdate-body" />
      </div>
    );
  }
}
