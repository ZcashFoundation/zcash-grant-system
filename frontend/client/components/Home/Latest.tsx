import React from 'react';
import { Link } from 'react-router-dom';
import { withNamespaces, WithNamespaces } from 'react-i18next';
import Loader from 'components/Loader';
import Placeholder from 'components/Placeholder';
import { getHomeLatest } from 'api/api';
import { Proposal, RFP } from 'types';
import './Latest.less';

interface State {
  latestProposals: Proposal[];
  latestRfps: RFP[];
  isLoading: boolean;
  error: string | null;
}

class HomeLatest extends React.Component<WithNamespaces, State> {
  state: State = {
    latestProposals: [],
    latestRfps: [],
    isLoading: true,
    error: null,
  };

  async componentDidMount() {
    try {
      const res = await getHomeLatest();
      this.setState({
        ...res.data,
        error: null,
        isLoading: false,
      });
    } catch (err) {
      // tslint:disable-next-line
      console.error('Failed to load homepage content:', err);
      this.setState({
        error: err.message,
        isLoading: false,
      });
    }
  }

  render() {
    const { t } = this.props;
    const { latestProposals, latestRfps, isLoading } = this.state;
    const numItems = latestProposals.length + latestRfps.length;

    let content;
    if (isLoading) {
      content = (
        <div className="HomeLatest-loader">
          <Loader size="large" />
        </div>
      );
    } else if (numItems) {
      const columns: ContentColumnProps[] = [
        {
          title: t('home.latest.proposalsTitle'),
          placeholder: t('home.latest.proposalsPlaceholder'),
          path: 'proposals',
          items: latestProposals,
        },
        {
          title: t('home.latest.requestsTitle'),
          placeholder: t('home.latest.requestsPlaceholder'),
          path: 'requests',
          items: latestRfps,
        },
      ];
      content = columns.filter(c => !!c.items.length).map((col, idx) => (
        <div className="HomeLatest-column" key={idx}>
          <ContentColumn {...col} />
        </div>
      ));
    } else {
      return null;
    }

    return (
      <div className="HomeLatest">
        <div className="HomeLatest-inner">{content}</div>
      </div>
    );
  }
}

interface ContentColumnProps {
  title: string;
  placeholder: string;
  path: string;
  items: Array<Proposal | RFP>;
}

const ContentColumn: React.SFC<ContentColumnProps> = p => {
  let content: React.ReactNode;
  if (p.items.length) {
    content = (
      <>
        {p.items.map(item => {
          const isProposal = (x: Proposal | RFP): x is Proposal =>
            (x as Proposal).proposalUrlId !== undefined;
          const id = isProposal(item) ? item.proposalId : item.id;
          const urlId = isProposal(item) ? item.proposalUrlId : item.urlId;

          return (
            <Link to={`/${p.path}/${urlId}`} key={id}>
              <div className="HomeLatest-column-item">
                <div className="HomeLatest-column-item-title">{item.title}</div>
                <div className="HomeLatest-column-item-brief">{item.brief}</div>
              </div>
            </Link>
          );
        })}
        <Link to={`/${p.path}`} className="HomeLatest-column-more">
          See more →
        </Link>
      </>
    );
  } else {
    content = <Placeholder title={p.placeholder} />;
  }
  return (
    <div className="HomeLatest-column">
      <h3 className="HomeLatest-column-title">{p.title}</h3>
      {content}
    </div>
  );
};

export default withNamespaces()(HomeLatest);
