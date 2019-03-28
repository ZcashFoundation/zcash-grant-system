import React from 'react';
import AuthFlow from 'components/AuthFlow';

const SignInPage = () => (
  <>
    <noscript className="noScript is-block">
      Sign in and account creation require Javascript. Please enable it to continue.
    </noscript>
    <AuthFlow />
  </>
);

export default SignInPage;
