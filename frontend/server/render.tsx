import React from 'react';
import { Request, Response } from 'express';
import { renderToString } from 'react-dom/server';
import { getLoadableState } from 'loadable-components/server';
import { StaticRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';

import log from './log';
import { configureStore } from '../client/store/configure';
import Html from './components/HTML';
import Routes from '../client/Routes';
import linkTags from './linkTags';
import metaTags from './metaTags';

import fs from 'fs';
import path from 'path';
// @ts-ignore
import * as paths from '../config/paths';
const isDev = process.env.NODE_ENV === 'development';

let cachedStats: any;
const getStats = () =>
  new Promise((res, rej) => {
    if (!isDev && cachedStats) {
      res(cachedStats);
      return;
    }
    const statsPath = path.join(paths.clientBuild, paths.publicPath, 'stats.json');
    fs.readFile(statsPath, (e, d) => {
      if (e) {
        rej(e);
        return;
      }
      cachedStats = JSON.parse(d.toString());
      res(cachedStats);
    });
  });

const extractLoadableIds = (tree: any): string[] => {
  const ids = (tree.id && [tree.id]) || [];
  if (tree.children) {
    return tree.children
      .reduce((a: string[], c: any) => a.concat(extractLoadableIds(c)), [])
      .concat(ids);
  }
  return ids;
};

// TODO: write tests for this
const chunkExtractFromLoadables = (loadableState: any) =>
  getStats().then((stats: any) => {
    const loadableIds = extractLoadableIds(loadableState.tree);
    const mods = stats.modules.filter(
      (m: any) =>
        m.reasons.filter((r: any) => loadableIds.indexOf(r.userRequest) > -1).length > 0,
    );
    const chunks = mods.reduce((a: string[], m: any) => a.concat(m.chunks), []);
    const origins = stats.chunks
      .filter((c: any) => chunks.indexOf(c.id) > -1)
      .map((c: any) => ({ loc: c.origins[0].loc, moduleId: c.origins[0].moduleId }));
    const origin = origins[0];
    const files = stats.chunks
      .filter(
        (c: any) =>
          c.origins.filter(
            (o: any) => origin && o.loc === origin.loc && o.moduleId === origin.moduleId,
          ).length > 0,
      )
      .reduce((a: string[], c: any) => a.concat(c.files), []);

    return {
      css: files.filter((f: string) => /.css$/.test(f)),
      js: files.filter((f: string) => /.js$/.test(f)),
    };
  });

const serverRenderer = () => async (req: Request, res: Response) => {
  const { store } = configureStore();
  const reactApp = (
    <Provider store={store}>
      <Router location={req.url} context={{}}>
        <Routes />
      </Router>
    </Provider>
  );

  let loadableState;
  let loadableFiles;
  // 1. loadable state will render dynamic imports
  try {
    loadableState = await getLoadableState(reactApp);
    loadableFiles = await chunkExtractFromLoadables(loadableState);
  } catch (e) {
    const disp = `Error getting loadable state for SSR`;
    e.message = disp + ': ' + e.message;
    log.error(e);
    return res.status(500).send(disp + ' (more info in server logs)');
  }
  // 2. render and collect state
  const content = renderToString(reactApp);
  const state = JSON.stringify(store.getState());

  // ! ensure manifest.json is available
  try {
    res.locals.getManifest();
  } catch (e) {
    const disp =
      'ERROR: Could not load client manifest.json, there was probably a client build error.';
    log.error(disp);
    return res.status(500).send(disp);
  }

  const cssFiles = ['bundle.css', 'vendor.css', ...loadableFiles.css]
    .map(f => res.locals.assetPath(f))
    .filter(Boolean);
  const jsFiles = [...loadableFiles.js, 'vendor.js', 'bundle.js']
    .map(f => res.locals.assetPath(f))
    .filter(Boolean);
  const mappedLinkTags = linkTags
    .map(l => ({ ...l, href: res.locals.assetPath(l.href) }))
    .filter(l => !!l.href);
  const mappedMetaTags = metaTags
    .map(m => ({ ...m, content: res.locals.assetPath(m.content) }))
    .filter(m => !!m.content);

  return res.send(
    '<!doctype html>' +
      renderToString(
        <Html
          css={cssFiles}
          scripts={jsFiles}
          linkTags={mappedLinkTags}
          metaTags={mappedMetaTags}
          state={state}
          loadableStateScript={loadableState.getScriptContent()}
        >
          {content}
        </Html>,
      ),
  );
};

export default serverRenderer;
