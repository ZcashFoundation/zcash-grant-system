import React from 'react';
import { withNamespaces, WithNamespaces } from 'react-i18next';
import SubmitIcon from 'static/images/guide-submit.svg';
import ReviewIcon from 'static/images/guide-review.svg';
import './CCRExplainer.less';
import * as ls from 'local-storage';
import { Button, Checkbox, Icon } from 'antd';

interface CreateProps {
  startSteps: () => void;
}

type Props = WithNamespaces & CreateProps;

const CCRExplainer: React.SFC<Props> = ({ startSteps }) => {
  const items = [
    {
      text:
        'Anyone can create a request for improvements to the Zcash ecosystem. Approved requests are posted publicly to garner interest for proposals.',
      icon: <SubmitIcon />,
    },
    {
      text:
        "The request is reviewed by the Zcash Foundation. \nYou'll be notified should the Zcash Foundation choose to make your request public.",
      icon: <ReviewIcon />,
    },
  ];

  return (
    <div className="CCRExplainer">
      <div className="CCRExplainer-header">
        <h2 className="CCRExplainer-header-title">Creating a Request</h2>
        <div className="CCRExplainer-header-subtitle">
          We can't wait to get your request! Before starting, here's what you should
          know...
        </div>
      </div>
      <div className="CCRExplainer-items">
        {items.map((item, idx) => (
          <div className="CCRExplainer-items-item" key={idx}>
            <div className="CCRExplainer-items-item-icon">{item.icon}</div>
            <div className="CCRExplainer-items-item-text">{item.text}</div>
          </div>
        ))}
      </div>
      <div className="CCRExplainer-actions">
        <Checkbox onChange={ev => ls.set<boolean>('noExplainCCR', ev.target.checked)}>
          Don't show this again
        </Checkbox>
        <Button
          className="CCRExplainer-create"
          type="primary"
          size="large"
          block
          onClick={() => startSteps()}
        >
          Let's do this <Icon type="right-circle-o" />
        </Button>
      </div>
    </div>
  );
};

export default withNamespaces()(CCRExplainer);
