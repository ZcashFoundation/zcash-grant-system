import React, { PureComponent } from 'react';
import './style.less';

export default class Contact extends PureComponent {
  render() {
    return (
      <div className="Contact">
        <h1 className="Contact-title">Contact Us</h1>
        <section>
          <p>
            You may contact the Grant.io project by emailing{' '}
            <a href="mailto:daniel@grant.io">daniel@grant.io</a>.
          </p>
        </section>
      </div>
    );
  }
}
