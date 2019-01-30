import React from 'react';
import { connect } from 'react-redux';
import Exception from 'ant-design-pro/lib/Exception';
import { fetchRfp } from 'modules/rfps/actions';
import { getRfp } from 'modules/rfps/selectors';
import { RFP } from 'types';
import { AppState } from 'store/reducers';
import Loader from 'components/Loader';

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
        return <Exception type="404" />;
      }
    }

    return (
      <pre>{JSON.stringify(rfp, null, 4)}</pre>
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
