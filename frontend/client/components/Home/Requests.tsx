import React from 'react';
import BN from 'bn.js';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withNamespaces, WithNamespaces } from 'react-i18next';
import Placeholder from 'components/Placeholder';
import Loader from 'components/Loader';
import RFPItem from 'components/RFPs/RFPItem';
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

type Props = StateProps & DispatchProps & WithNamespaces;

class HomeRequests extends React.Component<Props> {
  componentDidMount() {
    this.props.fetchRfps();
  }

  render() {
    const { t, rfps, isFetchingRfps } = this.props;

    // 2 live RFPs, sorted by highest bounty first
    const activeRfps = (rfps || [])
      .filter(rfp => rfp.status === RFP_STATUS.LIVE)
      .sort((a, b) => {
        const aBounty = a.bounty || new BN(0);
        const bBounty = b.bounty || new BN(0);
        return bBounty.sub(aBounty).toNumber();
      })
      .slice(0, 2);

    let content;
    if (activeRfps.length) {
      content = (
        <>
          {activeRfps.map(rfp => (
            <RFPItem key={rfp.id} rfp={rfp} />
          ))}
          <Link className="HomeRequests-content-more" to="/requests">
            {t('home.requests.more')} →
          </Link>
        </>
      );
    } else if (isFetchingRfps) {
      content = <Loader size="large" />;
    } else {
      content = (
        <Placeholder
          title={t('home.requests.emptyTitle')}
          subtitle={t('home.requests.emptySubtitle')}
        />
      );
    }

    return (
      <div className="HomeRequests">
        <div className="HomeRequests-divider" />
        <div className="HomeRequests-text">
          <h2 className="HomeRequests-text-title">{t('home.requests.title')}</h2>
          <div className="HomeRequests-text-description">
            {t('home.requests.description')
              .split('\n')
              .map((s: string, idx: number) => (
                <p key={idx} dangerouslySetInnerHTML={{ __html: s }} />
              ))}
          </div>
        </div>
        <div className="HomeRequests-content">{content}</div>
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
)(withNamespaces()(HomeRequests));
