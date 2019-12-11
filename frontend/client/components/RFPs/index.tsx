import React from 'react';
import { connect } from 'react-redux';
import { Divider } from 'antd';
import { fetchRfps } from 'modules/rfps/actions';
import { AppState } from 'store/reducers';
import { RFP } from 'types';
import { RFP_STATUS } from 'api/constants';
import Loader from 'components/Loader';
import Placeholder from 'components/Placeholder';
import RFPItem from './RFPItem';
import ZCFLogo from 'static/images/zcf.svg';
import './index.less';

interface StateProps {
  rfps: AppState['rfps']['rfps'];
  isFetchingRfps: AppState['rfps']['isFetchingRfps'];
  hasFetchedRfps: AppState['rfps']['hasFetchedRfps'];
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
    const { rfps, isFetchingRfps, hasFetchedRfps, fetchRfpsError } = this.props;

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
    } else if (!hasFetchedRfps && isFetchingRfps) {
      rfpsEl = (
        <div className="RFPs-loading">
          <Loader size="large" />
        </div>
      );
    } else {
      const live = rfps.filter(rfp => rfp.status === RFP_STATUS.LIVE);
      const closed = rfps.filter(rfp => rfp.status === RFP_STATUS.CLOSED);
      rfpsEl = (
        <>
          <Divider>Open Requests</Divider>
          {this.renderRfpsList(live)}
          {!!closed.length && (
            <>
              <Divider>Closed Requests</Divider>
              {this.renderRfpsList(closed, true)}
            </>
          )}
        </>
      );
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
              The Zcash Foundation periodically makes requests for proposals that solve
              high-priority needs in the Zcash ecosystem. In addition to funding from the
              Zcash Foundation, accepted proposals may receive supplemental donations from
              the community when they have set a "tip address" for their proposal.
            </p>
          </div>
        </div>
        {rfpsEl}
      </div>
    );
  }

  private renderRfpsList = (rfps: RFP[], isSmall?: boolean) => {
    return (
      <div className="RFPs-list">
        {rfps.map(rfp => (
          <RFPItem key={rfp.id} rfp={rfp} isSmall={isSmall} />
        ))}
        {!rfps.length && (
          <Placeholder
            title="No requests are currently active"
            subtitle="Check back later for more opportunities"
            loading={this.props.isFetchingRfps}
          />
        )}
      </div>
    );
  };
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    rfps: state.rfps.rfps,
    isFetchingRfps: state.rfps.isFetchingRfps,
    hasFetchedRfps: state.rfps.hasFetchedRfps,
    fetchRfpsError: state.rfps.fetchRfpsError,
  }),
  { fetchRfps },
)(RFPs);
