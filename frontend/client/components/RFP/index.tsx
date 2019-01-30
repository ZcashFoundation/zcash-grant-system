import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Icon } from 'antd';
import Exception from 'ant-design-pro/lib/Exception';
import { fetchRfp } from 'modules/rfps/actions';
import { getRfp } from 'modules/rfps/selectors';
import { RFP } from 'types';
import { AppState } from 'store/reducers';
import Loader from 'components/Loader';
import Markdown from 'components/Markdown';
import './index.less';

interface OwnProps {
  rfpId: number;
}

interface StateProps {
  rfp: RFP | undefined;
  isFetchingRfps: AppState['rfps']['isFetchingRfps'];
  fetchRfpsError: AppState['rfps']['fetchRfpsError'];
}

interface DispatchProps {
  fetchRfp: typeof fetchRfp;
}

type Props = OwnProps & StateProps & DispatchProps;

class RFPDetail extends React.Component<Props> {
  componentDidMount() {
    this.props.fetchRfp(this.props.rfpId);
  }

  render() {
    const { rfp, isFetchingRfps } = this.props;

    // Optimistically render rfp if we have it, but are updating it
    if (!rfp) {
      if (isFetchingRfps) {
        return <Loader size="large" />;
      } else {
        return <Exception type="404" desc="No request could be found" />;
      }
    }

    return (
      <div className="RFPDetail">
        <div className="RFPDetail-top">
          <Link className="RFPDetail-top-back" to="/requests">
            <Icon type="arrow-left" /> Back to Requests
          </Link>
          <div className="RFPDetail-top-date">
            Opened {moment(rfp.dateCreated * 1000).format('LL')}
          </div>
        </div>
        <h1 className="RFPDetail-title">{rfp.title}</h1>
        <Markdown className="RFPDetail-content" source={rfp.content} />
      </div>
    );
  }
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  (state, ownProps) => ({
    rfp: getRfp(state, ownProps.rfpId),
    isFetchingRfps: state.rfps.isFetchingRfps,
    fetchRfpsError: state.rfps.fetchRfpsError,
  }),
  { fetchRfp },
)(RFPDetail);
