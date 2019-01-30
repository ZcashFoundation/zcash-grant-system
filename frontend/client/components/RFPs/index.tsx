import React from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'antd';
import { fetchRfps } from 'modules/rfps/actions';
import { AppState } from 'store/reducers';
import { RFP } from 'types';
import { RFP_STATUS } from 'api/constants';
import Loader from 'components/Loader';
import Placeholder from 'components/Placeholder';
import RFPCard from './RFPCard';
import ZCFLogo from 'static/images/zcf.svg';
import './index.less';

interface StateProps {
  rfps: AppState['rfps']['rfps'];
  isFetchingRfps: AppState['rfps']['isFetchingRfps'];
  fetchRfpsError: AppState['rfps']['fetchRfpsError'];
}

interface DispatchProps {
  fetchRfps: typeof fetchRfps;
}

type Props = StateProps & DispatchProps;

class RFPs extends React.Component<Props> {
  componentDidMount() {
    this.props.fetchRfps();
  }

  render() {
    const { rfps, isFetchingRfps, fetchRfpsError } = this.props;

    let rfpsEl;
    if (fetchRfpsError) {
      rfpsEl = (
        <div className="RFPs-error">
          <Placeholder
            title="Something went wrong"
            subtitle="We had an issue fetching requests, try again later"
          />
        </div>
      );
    }
    else if (!isFetchingRfps) {
      rfpsEl = (
        <div className="RFPs-loading">
          <Loader size="large" />
        </div>
      );
    }
    else {
      const live = rfps.filter(rfp => rfp.status === RFP_STATUS.LIVE);
      const closed = rfps.filter(rfp => rfp.status === RFP_STATUS.CLOSED);
      rfpsEl = <>
        {this.renderRfpsList('Open Requests', live)}
        {closed.length && this.renderRfpsList('Closed Requests', closed)}
      </>;
    }

    return (
      <div className="RFPs">
        <div className="RFPs-about">
          <div className="RFPs-about-logo">
            <ZCFLogo />
          </div>
          <div className="RFPs-about-text">
            <h2 className="RFPs-about-text-title">Zcash Foundation Requests</h2>
            <p className="RFPs-about-text-desc">
              The Zcash Foundation periodically makes requests for proposals
              that solve high-priority needs in the Zcash ecosystem. These
              proposals will typically receive large or matched contributions,
              should they be approved by the foundation.
            </p>
          </div>
        </div>
        {rfpsEl}
      </div>
    );
  }

  private renderRfpsList = (title: string, rfps: RFP[]) => {
    return (
      <div className="RFPs-list">
        <h3 className="RFPs-list-title">{title}</h3>
        <div className="RFPs-list-rfps">
          {rfps.length ? (
            <Row gutter={20}>
              {rfps.map(rfp => (
                <Col xl={8} lg={12} md={24} key={rfp.id}>
                  <RFPCard key={rfp.id} rfp={rfp} />
                </Col>
              ))}
            </Row>
          ) : (
            <Placeholder
              title="No requests are currently active"
              subtitle="Check back later for more opportunities"
            />
          )}
        </div>
      </div>
    );
  };
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    rfps: state.rfps.rfps,
    isFetchingRfps: state.rfps.isFetchingRfps,
    fetchRfpsError: state.rfps.fetchRfpsError,
  }),
  { fetchRfps },
)(RFPs);
