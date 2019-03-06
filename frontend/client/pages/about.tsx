import React from 'react';
import MarkdownPage from 'components/MarkdownPage';

const About = () => {
  if (typeof window !== 'undefined') {
    window.location.href = 'https://www.zfnd.org/about/';
  }
  return <MarkdownPage markdown="Redirecting to zfnd.org..." />;
};

export default About;
