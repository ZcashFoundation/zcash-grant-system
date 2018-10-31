import React from 'react';
import { Link } from 'react-router-dom';
import HeaderDetails from 'components/HeaderDetails';
import Rocket from 'static/images/rocket.svg';
import './style.less';

export default class Home extends React.Component {
  render() {
    return (
      <div className="Home">
        <HeaderDetails
          title="Home"
          description="Grant.io organizes creators and community members to incentivize ecosystem
          improvements"
        />
        <div className="Home-hero">
          <div className="Home-hero-background">
            <div className="Home-hero-background-planets">
              <div className="Home-hero-background-planets-planet is-small" />
              <div className="Home-hero-background-planets-planet is-large" />
            </div>
            <Rocket className="Home-hero-background-rocket" />
          </div>

          <div className="Home-hero-inner">
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
          </div>
        </div>
      </div>
    );
  }
}
