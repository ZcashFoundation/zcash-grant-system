const chalk = require('chalk');
const net = require('net');

const logMessage = (message, level = 'info') => {
  const colors = { error: 'red', warning: 'yellow', info: 'blue' };
  colors[undefined] = 'white';
  console.log(`${chalk[colors[level]](message)}`);
};

const isPortTaken = port =>
  new Promise((res, rej) => {
    const tester = net
      .createServer()
      .once('error', function(err) {
        err.code != 'EADDRINUSE' && rej();
        err.code == 'EADDRINUSE' && res(true);
      })
      .once('listening', () => {
        tester.once('close', () => res(false)).close();
      })
      .listen(port, '127.0.0.1');
  });

module.exports = {
  logMessage,
  isPortTaken,
};
