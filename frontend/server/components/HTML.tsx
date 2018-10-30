import * as React from 'react';
import Helmet from 'react-helmet';

export interface Props {
  children: any;
  css: string[];
  scripts: string[];
  linkTags: Array<React.LinkHTMLAttributes<HTMLLinkElement>>;
  metaTags: Array<React.MetaHTMLAttributes<HTMLMetaElement>>;
  state: string;
  loadableStateScript: string;
}

const HTML: React.SFC<Props> = ({
  children,
  scripts,
  css,
  state,
  linkTags,
  metaTags,
  loadableStateScript,
}) => {
  const head = Helmet.renderStatic();
  return (
    <html lang="">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Grant.io" />
        <meta name="application-name" content="Grant.io" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#fff" />
        <meta name="theme-color" content="#fff" />
        {/* TODO: import from @fortawesome */}
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.2.0/css/all.css"
          integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ"
          crossOrigin="anonymous"
        />
        {/* Custom link & meta tags from webpack */}
        {linkTags.map((l, idx) => (
          <link key={idx} {...l as any} />
        ))}
        {metaTags.map((m, idx) => (
          <meta key={idx} {...m as any} />
        ))}

        {/* Component link & meta tags */}
        {head.base.toComponent()}
        {head.title.toComponent()}
        {head.meta.toComponent()}
        {head.link.toComponent()}
        {head.script.toComponent()}

        {css.map(href => {
          return <link key={href} rel="stylesheet" href={href} />;
        })}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__PRELOADED_STATE__ = ${state}`,
          }}
        />
      </head>
      <body>
        <div id="app" dangerouslySetInnerHTML={{ __html: children }} />
        <script dangerouslySetInnerHTML={{ __html: loadableStateScript }} />
        {scripts.map(src => {
          return <script key={src} src={src} />;
        })}
      </body>
    </html>
  );
};

export default HTML;
