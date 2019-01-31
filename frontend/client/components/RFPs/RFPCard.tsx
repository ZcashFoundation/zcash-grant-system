import React from 'react';
import { RFP } from 'types';
import Card from 'components/Card';
import './RFPCard.less';

interface Props {
  rfp: RFP;
}

export default class RFPCard extends React.Component<Props> {
  render() {
    const {
      id,
      title,
      brief,
      acceptedProposals: proposals,
      category,
      dateCreated,
    } = this.props.rfp;
    return (
      <Card className="RFPCard" to={`/requests/${id}`} title={title}>
        <p className="RFPCard-brief">{brief}</p>
        <div className="RFPCard-proposals">{proposals.length} proposals approved</div>

        <Card.Info category={category} time={dateCreated * 1000} />
      </Card>
    );
  }
}
