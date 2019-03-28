const express = require('express');
const path = require('path');
const enforce = require('express-sslify');

require('dotenv').config();
const isDev = process.env.NODE_ENV === 'development';
const PORT = process.env.PORT || 3500;
const app = express();

if (!isDev && !process.env.DISABLE_SSL) {
  console.log('PRODUCTION mode, enforcing HTTPS redirect');
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

app.use(express.static(__dirname + '/build'));

app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});

app.use('/favicon.ico', (req, res) => {
  res.send('');
});

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT} `);
});
