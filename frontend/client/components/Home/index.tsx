import React from 'react';
import * as Styled from './styled';
import { Redirect } from 'react-router-dom';
import { Icon } from 'antd';
import AntWrap from 'components/AntWrap';
import TeamsSvg from 'static/images/intro-teams.svg';
import FundingSvg from 'static/images/intro-funding.svg';
import CommunitySvg from 'static/images/intro-community.svg';

const introBlobs = [
  {
    Svg: TeamsSvg,
    text: 'Developers and teams propose projects for improving the ecosystem',
  },
  {
    Svg: FundingSvg,
    text: 'Projects are funded by the community and paid as it’s built',
  },
  {
    Svg: CommunitySvg,
    text: 'Open discussion and project updates bring devs and the community together',
  },
];

export default class Home extends React.Component {
  state = { redirect: '' };
  render() {
    if (this.state.redirect) {
      return <Redirect push to={this.state.redirect} />;
    }
    return (
      <AntWrap title="Home" isHeaderTransparent isFullScreen>
        <Styled.Hero>
          <Styled.HeroTitle>
           Decentralized funding for <br/> Blockchain ecosystem improvements
          </Styled.HeroTitle>

          <Styled.HeroButtons>
            <Styled.HeroButton
              onClick={() => this.setState({ redirect: '/create' })}
              isPrimary
            >
              Propose a Project
            </Styled.HeroButton>
            <Styled.HeroButton onClick={() => this.setState({ redirect: '/proposals' })}>
              Explore Projects
            </Styled.HeroButton>
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
                <blob.Svg />
                <p>{blob.text}</p>
              </Styled.IntroBlob>
            ))}
          </Styled.IntroBlobs>
        </Styled.Intro>
      </AntWrap>
    );
  }
}
