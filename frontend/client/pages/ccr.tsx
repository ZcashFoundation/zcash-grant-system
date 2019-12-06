import React, { Component } from 'react';
import CcrPreview from 'components/CCRFlow/CCRPreview'
import { extractIdFromSlug } from 'utils/api';

import { withRouter, RouteComponentProps } from 'react-router';

type RouteProps = RouteComponentProps<any>;

class CcrPage extends Component<RouteProps> {
  render() {
    const ccrId = extractIdFromSlug(this.props.match.params.id);
    return <CcrPreview id={ccrId}/>;
  }
}

export default withRouter(CcrPage);
