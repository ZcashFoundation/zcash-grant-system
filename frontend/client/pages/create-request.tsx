import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import CreateRequestDraftList from 'components/CCRDraftList';

type Props = RouteComponentProps<{}>;

class CreateRequestPage extends React.Component<Props> {
  render() {
    return (
      <>
        <noscript className="noScript is-block">
          Community Request creation requires Javascript. You’ll need to enable it to
          continue.
        </noscript>
        <CreateRequestDraftList />
      </>
    );
  }
}

export default withRouter(CreateRequestPage);
