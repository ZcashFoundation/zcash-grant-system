import React from 'react';
import { withNamespaces, WithNamespaces } from 'react-i18next';
import SubmitIcon from 'static/images/guide-submit.svg';
import ReviewIcon from 'static/images/guide-review.svg';
import CommunityIcon from 'static/images/guide-community.svg';
import './Explainer.less';
import * as ls from 'local-storage';
import { Button, Checkbox, Icon } from 'antd';

interface CreateProps {
  startSteps: () => void;
}

type Props = WithNamespaces & CreateProps;

const Explainer: React.SFC<Props> = ({ t, startSteps }) => {
  const items = [
    {
      text: t('home.guide.submit'),
      icon: <SubmitIcon />,
    },
    {
      text: t('home.guide.review'),
      icon: <ReviewIcon />,
    },
    {
      text: t('home.guide.community'),
      icon: <CommunityIcon />,
    },
  ];

  return (
    <div className="Explainer">
      <div className="Explainer-header">
        <h2 className="Explainer-header-title">Creating a Proposal</h2>
        <div className="Explainer-header-subtitle">
          We can't wait to get your request! Before starting, here's what you should
          know...
        </div>
      </div>
      <div className="Explainer-items">
        {items.map((item, idx) => (
          <div className="Explainer-items-item" key={idx}>
            <div className="Explainer-items-item-icon">{item.icon}</div>
            <div className="Explainer-items-item-text">{item.text}</div>
          </div>
        ))}
      </div>
      <div className="Explainer-actions">
        <Checkbox onChange={ev => ls.set<boolean>('noExplain', ev.target.checked)}>
          Don't show this again
        </Checkbox>
        <Button
          className="Explainer-create"
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

export default withNamespaces()(Explainer);
