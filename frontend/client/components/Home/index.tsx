import React from 'react';
import './style.less';
import { Link } from 'react-router-dom';
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
  render() {
    return (
      <AntWrap title="Home" isHeaderTransparent isFullScreen>
        <div className="Home">
          <div className="Home-hero">
            <h1 className="Home-hero-title">
              Decentralized funding for <br /> Blockchain ecosystem improvements
            </h1>

            <div className="Home-hero-buttons">
              <Link className="Home-hero-buttons-button is-primary" to="/create">
                Propose a Project
              </Link>
              <Link className="Home-hero-buttons-button" to="/proposals">
                Explore Projects
              </Link>
            </div>

            <button className="Home-hero-scroll">
              Learn More
              <Icon type="down" />
            </button>
          </div>

          <div className="Home-intro">
            <h3 className="Home-intro-text">
              Grant.io organizes creators and community members to incentivize ecosystem
              improvements
            </h3>

            <div className="Home-intro-blobs">
              {introBlobs.map((blob, i) => (
                <div className="Home-intro-blobs-blob" key={i}>
                  <blob.Svg />
                  <p>{blob.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AntWrap>
    );
  }
}
