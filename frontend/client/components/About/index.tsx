import React, { PureComponent } from 'react';
import './style.less';

export default class About extends PureComponent {
  render() {
    return (
      <div className="About">
        <h1 className="About-title">About Grant.io</h1>
        <section>
          <p>
            Grant.io organizes creators and community members to incentivize ecosystem
            improvements.
          </p>
        </section>
      </div>
    );
  }
}
