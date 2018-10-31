const express = require('express');
const path = require('path');

require('dotenv').config();
const PORT = process.env.PORT || 3500;
const app = express();

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
