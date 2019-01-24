import React from 'react';
import { Spin } from 'antd';
import moment from 'moment';
import { EmailExample } from '../../types';
import './Example.less';

interface Props {
  email?: EmailExample;
}

export default class Example extends React.Component<Props> {
  render() {
    const { email } = this.props;
    let content;

    if (email) {
      content = [
        <div key="inbox" className="Example-section">
          <h2 className="Example-section-title">Inbox</h2>
          <div className="Example-inbox">
            <div className="Example-inbox-left">
              <div className="Example-inbox-left-icon is-checkbox" />
              <div className="Example-inbox-left-icon is-favorite" />
              <div className="Example-inbox-left-sender">ZF Grants</div>
            </div>
            <div className="Example-inbox-subject">
              <strong>{email.info.subject}</strong>
              <small>
                {' - '}
                {email.info.preview}
              </small>
            </div>
            <div className="Example-inbox-time">{moment().format('MMM Do')}</div>
          </div>
        </div>,
        <div key="html" className="Example-section">
          <h2 className="Example-section-title">HTML</h2>
          <div className="Example-html">
            <div
              className="Example-html-content"
              dangerouslySetInnerHTML={{ __html: email.html }}
            />
          </div>
        </div>,
        <div key="text" className="Example-section">
          <h2 className="Example-section-title">Text</h2>
          <div className="Example-text">
            <pre>{email.text}</pre>
          </div>
        </div>,
      ];
    } else {
      content = <Spin />;
    }

    return <div className="Example">{content}</div>;
  }
}
