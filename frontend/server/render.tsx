import path from 'path';
import React from 'react';
import { Request, Response, NextFunction } from 'express';
import { renderToString } from 'react-dom/server';
import { ChunkExtractor } from '@loadable/server';
import { StaticRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { configureStore } from '../client/store/configure';
import Html from './components/HTML';
import Routes from '../client/Routes';
import linkTags from './linkTags';
import metaTags from './metaTags';
import i18n from './i18n';

// @ts-ignore
import * as paths from '../config/paths';
import { storeActionsForPath } from './ssrAsync';

const serverRenderer = async (req: Request, res: Response) => {
  const { store } = configureStore();
  await storeActionsForPath(req.url, store);

  // i18n
  const locale = (req as any).language;
  const resources = i18n.getResourceBundle(locale, 'common');
  const i18nClient = JSON.stringify({ locale, resources });
  const i18nServer = i18n.cloneInstance();
  i18nServer.changeLanguage(locale);

  const reactApp = (
    <I18nextProvider i18n={i18nServer}>
      <Provider store={store}>
        <Router location={req.url} context={{}}>
          <Routes />
        </Router>
      </Provider>
    </I18nextProvider>
  );

  let extractor;
  // 1. loadable state will render dynamic imports
  const statsFile = path.join(paths.clientBuild, paths.publicPath, 'loadable-stats.json');
  extractor = new ChunkExtractor({ statsFile, entrypoints: ['bundle'] });

  // 2. render and collect state
  const content = renderToString(extractor.collectChunks(reactApp));
  const state = JSON.stringify(store.getState());

  // ! ensure manifest.json is available
  res.locals.getManifest();

  const cssFiles = ['bundle.css', 'vendor.css']
    .map(f => res.locals.assetPath(f))
    .filter(Boolean);
  const mappedLinkTags = linkTags
    .map(l => ({ ...l, href: res.locals.assetPath(l.href) }))
    .filter(l => !!l.href);
  const mappedMetaTags = metaTags
    .map(m => ({ ...m, content: res.locals.assetPath(m.content) }))
    .filter(m => !!m.content);

  const html = renderToString(
    <Html
      css={cssFiles}
      linkTags={mappedLinkTags}
      metaTags={mappedMetaTags}
      state={state}
      i18n={i18nClient}
      extractor={extractor}
    >
      {content}
    </Html>,
  );
  return res.send('<!doctype html>' + html);
};

// Wrap in function to handle async errors
export default function() {
  return (req: Request, res: Response, next: NextFunction) => {
    serverRenderer(req, res)
      .then(() => next())
      .catch(err => next(err));
  };
}
