const rimraf = require('rimraf');
const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const Web3 = require('web3');

const paths = require('../config/paths');
const truffleConfig = require('../truffle');
const { logMessage } = require('./utils');

require('../config/env');

module.exports = {};

const clean = (module.exports.clean = () => {
  rimraf.sync(paths.contractsBuild);
});

const compile = (module.exports.compile = () => {
  childProcess.execSync('yarn build', { cwd: paths.contractsBase });
});

const migrate = (module.exports.migrate = () => {
  childProcess.execSync('truffle migrate', { cwd: paths.contractsBase });
});

const makeWeb3Conn = () => {
  const { host, port } = truffleConfig.networks.development;
  return `ws://${host}:${port}`;
};

const createWeb3 = () => {
  return new Web3(makeWeb3Conn());
};

const isGanacheUp = (module.exports.isGanacheUp = verbose =>
  new Promise((res, rej) => {
    verbose && logMessage(`Testing ganache @ ${makeWeb3Conn()}...`, 'info');
    // console.log('curProv', web3.eth.currentProvider);
    const web3 = createWeb3();
    web3.eth.net
      .isListening()
      .then(() => {
        verbose && logMessage('Ganache is UP!', 'info');
        res(true);
        web3.currentProvider.connection.close();
      })
      .catch(e => {
        logMessage('Ganache appears to be down, unable to connect.', 'error');
        res(false);
      });
  }));

const getGanacheNetworkId = (module.exports.getGanacheNetworkId = () => {
  const web3 = createWeb3();
  return web3.eth.net
    .getId()
    .then(id => {
      web3.currentProvider.connection.close();
      return id;
    })
    .catch(() => -1);
});

const checkContractsNetworkIds = (module.exports.checkContractsNetworkIds = id =>
  new Promise((res, rej) => {
    const buildDir = paths.contractsBuild;
    fs.readdir(buildDir, (err, names) => {
      if (err) {
        logMessage(`No contracts build directory @ ${buildDir}`, 'error');
        res(false);
      } else {
        const allHaveId = names.reduce((ok, name) => {
          const contract = require(path.join(buildDir, name));
          if (Object.keys(contract.networks).length > 0 && !contract.networks[id]) {
            const actual = Object.keys(contract.networks).join(', ');
            logMessage(`${name} should have networks[${id}], it has ${actual}`, 'error');
            return false;
          }
          return true && ok;
        }, true);
        res(allHaveId);
      }
    });
  }));

const fundWeb3v1 = (module.exports.fundWeb3v1 = () => {
  // Fund ETH accounts
  const ethAccounts = process.env.FUND_ETH_ADDRESSES
    ? process.env.FUND_ETH_ADDRESSES.split(',').map(a => a.trim())
    : [];
  const web3 = createWeb3();
  return web3.eth.getAccounts().then(accts => {
    if (ethAccounts.length) {
      logMessage('Sending 50% of ETH balance from accounts...', 'info');
      const txs = ethAccounts.map((addr, i) => {
        return web3.eth
          .getBalance(accts[i])
          .then(parseInt)
          .then(bal => {
            const amount = '' + Math.round(bal / 2);
            const amountEth = web3.utils.fromWei(amount);
            return web3.eth
              .sendTransaction({
                to: addr,
                from: accts[i],
                value: amount,
              })
              .then(() => logMessage(`    ${addr} <- ${amountEth} from ${accts[i]}`))
              .catch(e =>
                logMessage(`    Error sending funds to ${addr} : ${e}`, 'error'),
              );
          });
      });
      return Promise.all(txs).then(() => web3.currentProvider.connection.close());
    } else {
      logMessage('No accounts specified for funding in .env file...', 'warning');
    }
  });
});

module.exports.ethereumCheck = () =>
  isGanacheUp(true)
    .then(isUp => !isUp && Promise.reject('network down'))
    .then(getGanacheNetworkId)
    .then(checkContractsNetworkIds)
    .then(allHaveId => {
      if (!allHaveId) {
        logMessage('Contract problems, will compile & migrate.', 'warning');
        clean();
        logMessage('truffle compile, please wait...', 'info');
        compile();
        logMessage('truffle migrate, please wait...', 'info');
        migrate();
        fundWeb3v1();
      } else {
        logMessage('OK, Contracts have correct network id.', 'info');
      }
    })
    .catch(e => logMessage('WARNING: ethereum setup has a problem: ' + e, 'error'));
