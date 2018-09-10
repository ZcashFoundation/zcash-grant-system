import React from 'react';
import * as Styled from './styled';
import Link from 'next/link';
import { Icon } from 'antd';
import AntWrap from 'components/AntWrap';

const introBlobs = [
  {
    image: 'static/images/intro-teams.svg',
    text: 'Developers and teams propose projects for improving the ecosystem',
  },
  {
    image: 'static/images/intro-funding.svg',
    text: 'Projects are funded by the community and paid as it’s built',
  },
  {
    image: 'static/images/intro-community.svg',
    text: 'Open discussion and project updates bring devs and the community together',
  },
];

export default class Home extends React.Component {
  render() {
    return (
      <AntWrap title="Home" isHeaderTransparent isFullScreen>
        <Styled.Hero>
          <Styled.HeroTitle>Community-first project funding</Styled.HeroTitle>

          <Styled.HeroButtons>
            <Link href="/create">
              <Styled.HeroButton isPrimary>Propose a Project</Styled.HeroButton>
            </Link>
            <Link href="/proposals">
              <Styled.HeroButton>Explore Projects</Styled.HeroButton>
            </Link>
          </Styled.HeroButtons>

          <Styled.HeroScroll>
            Learn More
            <Icon type="down" />
          </Styled.HeroScroll>
        </Styled.Hero>

        <Styled.Intro>
          <Styled.IntroText>
            Grant.io organizes creators and community members to incentivize ecosystem
            improvements
          </Styled.IntroText>

          <Styled.IntroBlobs>
            {introBlobs.map((blob, i) => (
              <Styled.IntroBlob key={i}>
                <img src={blob.image} />
                <p>{blob.text}</p>
              </Styled.IntroBlob>
            ))}
          </Styled.IntroBlobs>
        </Styled.Intro>
      </AntWrap>
    );
  }
}
