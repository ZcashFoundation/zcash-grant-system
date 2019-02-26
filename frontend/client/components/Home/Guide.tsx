import React from 'react';
import copy from './copy';
import SubmitIcon from 'static/images/guide-submit.svg';
import ReviewIcon from 'static/images/guide-review.svg';
import CommunityIcon from 'static/images/guide-community.svg';
import CompleteIcon from 'static/images/guide-complete.svg';
import './Guide.less';

const HomeGuide: React.SFC<{}> = () => {
  const items = [{
    text: copy.guideOne,
    icon: <SubmitIcon />,
  }, {
    text: copy.guideTwo,
    icon: <ReviewIcon />,
  }, {
    text: copy.guideThree,
    icon: <CommunityIcon />,
  }, {
    text: copy.guideFour,
    icon: <CompleteIcon />,
  }];

  return (
    <div className="HomeGuide" id="home-guide">
      <svg className="HomeGuide-cap" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="100 0, 100 100, 0 100"/>
      </svg>
      <h2 className="HomeGuide-title">
        {copy.guideTitle}
      </h2>
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

export default HomeGuide;
