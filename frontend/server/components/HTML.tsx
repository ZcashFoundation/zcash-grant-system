import * as React from 'react';
import { Helmet } from 'react-helmet';
import { ChunkExtractor } from '@loadable/server';

export interface Props {
  children: any;
  css: string[];
  linkTags: Array<React.LinkHTMLAttributes<HTMLLinkElement>>;
  metaTags: Array<React.MetaHTMLAttributes<HTMLMetaElement>>;
  state: string;
  i18n: string;
  extractor: ChunkExtractor;
}

const HTML: React.SFC<Props> = ({
  children,
  css,
  state,
  i18n,
  linkTags,
  metaTags,
  extractor,
}) => {
  const head = Helmet.renderStatic();
  const extractedStyleElements = extractor.getStyleElements();

  // Move `bundle.css` to beginning of array so custom styles don't get overwritten
  const bundleIndex = extractedStyleElements.findIndex(element => {
    return typeof element.key === 'string' && /^.*\/bundle\.css$/.test(element.key);
  });
  if (bundleIndex !== -1) {
    const [bundle] = extractedStyleElements.splice(bundleIndex, 1);
    extractedStyleElements.unshift(bundle);
  }

  return (
    <html lang="">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ZF Grants" />
        <meta name="application-name" content="ZF Grants" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#fff" />
        <meta name="theme-color" content="#fff" />
        {/* Custom link & meta tags from webpack */}
        {extractor.getLinkElements()}
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
          return <link key={href} type="text/css" rel="stylesheet" href={href} />;
        })}

        {extractedStyleElements}

        <script
          dangerouslySetInnerHTML={{
            __html: `window.__PRELOADED_STATE__ = ${state}`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__PRELOADED_I18N__ = ${i18n}`,
          }}
        />
        {extractor.getScriptElements()}
      </head>
      <body>
        <div id="app" dangerouslySetInnerHTML={{ __html: children }} />
      </body>
    </html>
  );
};

export default HTML;
