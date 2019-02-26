import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Placeholder from 'components/Placeholder';
import Loader from 'components/Loader';
import RFPItem from 'components/RFPs/RFPItem';
import copy from './copy';
import { convert } from 'utils/markdown';
import { fetchRfps } from 'modules/rfps/actions';
import { AppState } from 'store/reducers';
import './Requests.less';
import { RFP_STATUS } from 'api/constants';

interface StateProps {
  rfps: AppState['rfps']['rfps'];
  isFetchingRfps: AppState['rfps']['isFetchingRfps'];
}

interface DispatchProps {
  fetchRfps: typeof fetchRfps;
}

type Props = StateProps & DispatchProps;

class HomeRequests extends React.Component<Props> {
  componentDidMount() {
    this.props.fetchRfps();
  }

  render() {
    const { rfps, isFetchingRfps } = this.props;
    const activeRfps = (rfps || []).filter(rfp => rfp.status === RFP_STATUS.LIVE).slice(0, 2);

    let content;
    if (activeRfps.length) {
      content = (
        <>
          {activeRfps.map(rfp => (
            <RFPItem key={rfp.id} rfp={rfp} />
          ))}
          <Link className="HomeRequests-content-more" to="/requests">See all requests →</Link>
        </>
      );
    } else if (isFetchingRfps) {
      content = <Loader size="large" />;
    } else {
      content = (
        <Placeholder
          title="No open requests at this time"
          subtitle="But don’t let that stop you, proposals can be submitted at any time"
        />
      );
    }

    return (
      <div className="HomeRequests">
        <div className="HomeRequests-divider" />
        <div className="HomeRequests-text">
          <h2 className="HomeRequests-text-title">{copy.requestTitle}</h2>
          <div
            className="HomeRequests-text-description"
            dangerouslySetInnerHTML={{ __html: convert(copy.requestDescription) }}
          />
        </div>
        <div className="HomeRequests-content">
          {content}
        </div>
      </div>
    );
  }
}

export default connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    rfps: state.rfps.rfps,
    isFetchingRfps: state.rfps.isFetchingRfps,
  }),
  { fetchRfps },
)(HomeRequests);
