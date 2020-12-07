import React from 'react';
import { withNamespaces, WithNamespaces } from 'react-i18next';
import SubmitIcon from 'static/images/guide-submit.svg';
import ReviewIcon from 'static/images/guide-review.svg';
import CommunityIcon from 'static/images/guide-community.svg';
import CompleteIcon from 'static/images/guide-complete.svg';
import './Guide.less';

const HomeGuide: React.SFC<WithNamespaces> = ({ t }) => {
  const items = [
    {
      text: <p>Individuals and teams submit proposals against requests from the community or the Zcash Foundation or <a href="https://zcashomg.org/">Zcash Open Major Grants (ZOMG)</a>, or submit one of their own ideas</p>,
      icon: <SubmitIcon />,
    },
    {
      text: <p>The proposal is reviewed by the Zcash Foundation or <a href="https://zcashomg.org/">Zcash Open Major Grants (ZOMG)</a>, after which the proposal may be accepted with or without funding. In cases where the proposal is accepted without funding, the community may donate directly when the team has set a tip address.</p>,
      icon: <ReviewIcon />,
    },
    {
      text: <p>The proposal is then opened up to the community to discuss, provide feedback, and optionally donate to the team</p>,
      icon: <CommunityIcon />,
    },
    {
      text: <p>The proposal creator(s) post updates with their progress, and if having received a bounty, are paid out as they reach project milestones</p>,
      icon: <CompleteIcon />,
    },
  ];

  return (
    <div className="HomeGuide" id="home-guide">
      <svg className="HomeGuide-cap" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="100 0, 100 100, 0 100" />
      </svg>
      <h2 className="HomeGuide-title">{t('home.guide.title')}</h2>
      <div className="HomeGuide-items">
        {items.map((item, idx) => (
          <div className="HomeGuide-items-item" key={idx}>
            <div className="HomeGuide-items-item-text">{item.text}</div>
            <div className="HomeGuide-items-item-icon">{item.icon}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default withNamespaces()(HomeGuide);
