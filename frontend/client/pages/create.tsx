import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { parse } from 'query-string';
import DraftList from 'components/DraftList';

type Props = RouteComponentProps<{ rfp?: string }>;

class CreatePage extends React.Component<Props> {
  render() {
    const { location } = this.props;
    const parsed = parse(location.search);
    const rfpId = parsed.rfp ? parseInt(parsed.rfp, 10) : undefined;
    return <DraftList createIfNone createWithRfpId={rfpId} />;
  }
}

export default withRouter(CreatePage);
