/* eslint-disable no-console */
const express = require('express');
const next = require('next');
const cookieParser = require('cookie-parser');

const routes = require('./routes');

// const devProxy = {
//   '/api': {
//     target: 'http://localhost:5000/api/',
//     pathRewrite: { '^/api': '/' },
//     changeOrigin: true
//   }
// };

const port = parseInt(process.env.PORT, 10) || 3000;
const env = process.env.NODE_ENV;
const dev = env !== 'production';
const app = next({
  dir: 'client', // base directory where everything is, could move to client later
  dev
});
const handler = routes.getRequestHandler(app);

let server;
app
  .prepare()
  .then(() => {
    server = express();

    // Set up the proxy.
    // if (dev && devProxy) {
    //   const proxyMiddleware = require('http-proxy-middleware');
    //   Object.keys(devProxy).forEach(function(context) {
    //     server.use(proxyMiddleware(context, devProxy[context]));
    //   });
    // }
    //
    // server.use(cookieParser());
    //
    //
    // server.get('/login', (req, res) => {
    //   if(req.cookies.token) {
    //     res.redirect('/');
    //   } else {
    //     return app.render(req, res, '/login', req.query);
    //   }
    // });

    // server.get('/signup', (req, res) => {
    //   if(req.cookies.token) {
    //     res.redirect('/');
    //   } else {
    //     return app.render(req, res, '/signup', req.query);
    //   }
    // });

    // Default catch-all handler to allow Next.js to handle all other routes
    server.all('*', (req, res) => handler(req, res));

    server.listen(port, err => {
      if (err) {
        throw err;
      }
      console.log(`> Ready on port ${port}`);
    });
  })
  .catch(err => {
    console.log('An error occurred, unable to start the server');
    console.log(err);
  });
