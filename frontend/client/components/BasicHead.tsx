import React from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps, withRouter } from 'react-router';
import { withNamespaces, WithNamespaces } from 'react-i18next';
import ogpLogo from 'static/images/ogp-logo.png';
import { urlToPublic } from 'utils/helpers';

interface OwnProps {
  title: string;
}

type Props = OwnProps & RouteComponentProps<any> & WithNamespaces;

class BasicHead extends React.Component<Props> {
  render() {
    const { children, title, t } = this.props;
    const defaultOgpUrl = process.env.PUBLIC_HOST_URL + this.props.location.pathname;
    const defaultOgpImage = urlToPublic(ogpLogo);
    return (
      <div>
        <Helmet>
          <title>{`ZF Grants - ${title}`}</title>
          <meta name="description" content={t('site.description')} />
          <meta
            name="keywords"
            content="Zcash, Zcash Foundation, Zcash Foundation Grants, Zcash Grants, Zcash Grant, ZF Grants, ZFGrants"
          />
          <meta name={`${title} page`} content={`${title} page stuff`} />
          <link
            rel="stylesheet"
            href="https://use.fontawesome.com/releases/v5.2.0/css/all.css"
            integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ"
            crossOrigin="anonymous"
          />

          {/* open graph protocol defaults, can be overridden in children <HeaderDetails ...> */}
          <meta property="og:site_name" content="ZF Grants" />
          <meta property="og:title" content={`ZF Grants - ${title}`} />
          <meta property="og:description" content={t('site.description')} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={defaultOgpUrl} />
          <meta property="og:image" content={defaultOgpImage} />
          <meta property="og:locale" content="en_US" />
          {/* <meta property="og:locale:alternate" content="en_US" /> */}
          {/* <meta property="og:locale:alternate" content="de_DE" /> */}

          {/* twitter defaults, can be overridden in children <HeaderDetails ...> */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:site" content="@zcashfoundation" />
          <meta property="twitter:title" content={`ZF Grants - ${title}`} />
          <meta property="twitter:description" content={t('site.description')} />
          <meta property="twitter:image" content={defaultOgpImage} />
          <meta property="twitter:url" content={defaultOgpUrl} />
        </Helmet>
        {children}
      </div>
    );
  }
}

export default withNamespaces()(withRouter(BasicHead));
